import {select, settings, classNames, templates} from "../settings.js";
import {utils} from '../utils.js';
import CartProduct from './cartproduct.js';
class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }
    
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.address = element.querySelector(select.cart.address);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct) 
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    remove(productToRemove){
      const thisCart = this;
      productToRemove.dom.wrapper.remove();
      const indexOfProduct = thisCart.products.indexOf('productToRemove');
      thisCart.products.splice(indexOfProduct,1);
      thisCart.update();
    }

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update() {
      const thisCart = this;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      if(thisCart.totalNumber!==0){
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
          thisCart.deliveryFee = 0;
          thisCart.totalPrice = 0;
        } 

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

      for (let price of thisCart.dom.totalPrice){
        price.innerHTML = thisCart.totalPrice;
      }
    }

    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
        adress: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }
      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }
}

export default Cart;