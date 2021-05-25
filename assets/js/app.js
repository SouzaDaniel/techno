const vm = new Vue({
  el: "#app",
  data: {
    products: [],
    product: false,
    cart: [],
    alertActive: false,
    alertMessage: "",
    cartModalOpen: false,
  },
  computed: {
    cartItemsTotal() {
      return this.cart.length;
    },
    cartItemsPrice() {
      let total = 0;

      if (!this.cart.length) return 0;

      this.cart.forEach((item) => (total += item.price));
      return total;
    },
  },
  methods: {
    async fetchProducts() {
      const res = await fetch("https://souzadaniel.github.io/techno/api/produtos.json");
      const data = await res.json();

      return data;
    },
    async fetchProduct(id) {
      const res = await fetch(`https://souzadaniel.github.io/techno/api/produtos/${id}/dados.json`);
      const data = await res.json();

      return data;
    },
    async openProductModal(id) {
      const product = await this.fetchProduct(id);
      this.product = product;

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    closeProductModal({ target, currentTarget }) {
      target === currentTarget && (this.product = false);
    },
    closeCartModal({ target, currentTarget }) {
      target === currentTarget && (this.cartModalOpen = false);
    },
    addItemToCart() {
      this.product.stock--;
      const { id, name, price } = this.product;

      this.cart.push({ id, name, price });
      this.displayMessage(`${name} adicionado ao carrinho!`);
    },
    removeItemFromCart(index) {
      this.displayMessage(`${this.cart[index].name} removido do carrinho!`);
      this.cart.splice(index, 1);
    },
    displayMessage(message) {
      this.alertMessage = message;
      this.alertActive = true;

      setTimeout(() => {
        this.alertActive = false;
      }, 3000);
    },
    async router() {
      const hash = document.location.hash.replace("#", "");

      hash && (await this.openProductModal(hash));
    },
    compareStock() {
      const items = this.cart.filter(({ id }) => id === this.product.id);

      this.product.stock -= items.length;
    },
  },
  watch: {
    product() {
      document.title = this.product.name || "Techno";
      const path = this.product.id || "";
      history.pushState(null, null, `#${path}`);

      if (this.product) {
        this.compareStock();
      }
    },
    cart() {
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },
  },
  filters: {
    numberToPrice(value) {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  async created() {
    const products = await this.fetchProducts();
    this.products = products;

    const cart = JSON.parse(localStorage.getItem("cart"));
    cart && (this.cart = cart);

    this.router();
  },
});
