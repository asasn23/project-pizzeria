import {select} from '../settings.js';
import AmountWidget from './amountwidget.js';
class CartProduct { 
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElement(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElement(element) {
      const  thisCartProduct = this;
      thisCartProduct.dom = {
        wrapper: element,
        amountWidget: element.querySelector(select.cartProduct.amountWidget),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
      };
    }

    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        const amount = thisCartProduct.amountWidget.value;
        const price = thisCartProduct.priceSingle;
        thisCartProduct.amount = amount;
        thisCartProduct.price = amount * price;
        thisCartProduct.dom.price.innerHTML = price * amount;
      });
    }

    remove(){
      const thisCartProduct = this;
      const event = new CustomEvent ('remove',{
        bubbles: true,
        detail: {
        cartProduct: thisCartProduct,
        },
      }) ;
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', event => {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', event =>{
        event.preventDefault();
        console.log('removed');
        thisCartProduct.remove();
      });
    }

    getData() {
      const thisCartProduct = this;
      const CartproductSummary = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price:  thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };
      return CartproductSummary;
    }
  }

export default CartProduct;