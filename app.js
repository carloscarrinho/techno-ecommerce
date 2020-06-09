const vm = new Vue({
  el: '#app',
  
  data: {
    msg: 'Hello world',
    products: [],
    product: false,
    cart: [],
    alertMsg: 'Item adicionado',
    activeAlert: false,
    activeCart: false,
  },
  
  filters: {
    numbToPrice(value) {
      return value.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
    }
  },

  computed: {
    totalCart() {
      if(this.cart.length === 0) return 0;
      let total = this.cart.reduce((accum, currentItem) => {
        return accum + currentItem.preco;
      }, 0);
      return total;
    }
  },

  methods: {
    async fetchProducts() {
      const res = await fetch('./api/produtos.json');
      const json = await res.json();
      this.products = json;
    },
    
    async fetchProduct(id) {
      const res = await fetch(`./api/produtos/${id}/dados.json`);
      const json = await res.json();
      this.product = json;
    },
    
    openModal(id) {
      this.fetchProduct(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },

    closeModal({ target, currentTarget }) {
      if(target === currentTarget) this.product = false;
    },

    addItem() {
      this.product.estoque--;
      const { id, nome, preco } = this.product;
      this.cart.push({ id, nome, preco });
      this.triggerAlert(`${nome} adicionado ao carrinho`);
    },

    removeItem(index) {
      this.cart.splice(index, 1);
    },

    checkLocalStorage() {
      if (window.localStorage.cart) {
        this.cart = JSON.parse(window.localStorage.cart);
      }
    },

    triggerAlert(message) {
      this.alertMsg = message;
      this.activeAlert = true;
      setTimeout(() => {
        this.activeAlert = false;
      }, 2500);
    },

    router() {
      const hash = document.location.hash;
      if(hash) this.fetchProduct(hash.replace('#', ''));
    },

    closeCartView({ target, currentTarget }) {
      if(target === currentTarget) this.activeCart = false;
    },

    stockCompare() {
      const items = this.cart.filter(item => item.id === this.product.id);
      this.product.estoque -= items.length;
    }
  },

  watch: {
    product() {
      document.title = this.product.nome || "Techno";
      const hash = this.product.id || "";
      history.pushState(null,null, `#${hash}`);
      if(this.product) this.stockCompare();
    },

    cart() {
      window.localStorage.cart = JSON.stringify(this.cart);
    }
  },
  
  created() {
    this.fetchProducts();
    this.checkLocalStorage();
    this.router();
  }
});