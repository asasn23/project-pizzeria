import {settings, select, classNames, templates} from './settings.js';
import Product from './components/product.js';
import Cart from './components/cart.js';
import Booking from './components/booking.js';
import Home from './components/home.js';

const app = {
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);
    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;
    for (let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for (let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },

  initMenu: function(){
    const thisApp = this;
    console.log('thisApp.data:', thisApp.data);
    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },  

  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
    .then(function(rawResponse){
      return rawResponse.json();
    })
    .then(function(parsedResponse){
      console.log('parsedResponse',parsedResponse);
      thisApp.data.products = parsedResponse;
      thisApp.initMenu();
    });
    console.log('thisApp.data',JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function() {
    const thisApp = this;
    thisApp.bookingWidgetElement = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.bookingWidgetElement);
  },

  initHome: function (){
    const thisApp = this;
      thisApp.homeContainer = document.querySelector(select.containerOf.home);

      thisApp.home = new Home(thisApp.homeContainer);

      thisApp.homeLinks=document.querySelectorAll(select.home.homeLinks)
      for (let homeLink of thisApp.homeLinks){
        homeLink.addEventListener('click', function(event){
          const clickedElement = this;
          console.log('clickedelement',clickedElement);
          event.preventDefault();
          const linkId = clickedElement.getAttribute('href').replace('#','');
          thisApp.activatePage(linkId);
          window.location.hash = '#/' + linkId;
        });
      }
    },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
  },
};

app.init();