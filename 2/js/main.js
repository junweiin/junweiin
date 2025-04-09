const app = Vue.createApp({
  data() {
    return {
      formData: {
        name: '',
        phone: '',
        quantity: 1,
        pickupDate: '',
        remarks: ''
      },
      showModal: false,
      voucherCode: ''
    }
  },
  methods: {
    increaseQuantity() {
      if (this.formData.quantity < 10) {
        this.formData.quantity++;
      }
    },
    decreaseQuantity() {
      if (this.formData.quantity > 1) {
        this.formData.quantity--;
      }
    },
    submitForm() {
      // 表单验证
      if (!this.formData.name || !this.formData.phone || !this.formData.pickupDate) {
        alert('请填写完整信息');
        return;
      }
      
      // 模拟API调用
      this.voucherCode = 'ZJ' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    }
  }
});

app.mount('#app');