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
    async submitForm() {
      // 表单验证
      if (!this.formData.name || !this.formData.phone || !this.formData.pickupDate) {
        alert('请填写完整信息');
        return;
      }

      try {
        // 生成券码
        this.voucherCode = 'ZJ' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        // 准备提交到维格表的数据
        const submitData = {
          records: [{
            fields: {
              姓名: this.formData.name,
              手机号: this.formData.phone,
              预约日期: this.formData.pickupDate,
              购买数量: this.formData.quantity.toString(),
              备注: this.formData.remarks || '无',
              提交时间: new Date().toLocaleString('zh-CN', {hour12: false}),
              券码: this.voucherCode
            }
          }],
          fieldKey: 'name'
        };

        // 调用维格表API
        const response = await fetch('https://api.vika.cn/fusion/v1/datasheets/dstsArmWtVKpWT63eD/records?viewId=viwqigBuykwu3&fieldKey=name', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer uskcZUvxWXvLIPXN0hUC6DK',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });

        if (!response.ok) {
          throw new Error('提交失败');
        }

        // 显示成功弹窗
        this.showModal = true;
      } catch (error) {
        console.error('提交数据出错:', error);
        alert('提交失败，请稍后重试');
      }
    },
    closeModal() {
      this.showModal = false;
    }
  }
});

app.mount('#app');