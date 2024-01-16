import {templates} from '../settings.js';
import {utils} from '../utils.js';

class Home {
    constructor (element){
        const thisHome = this;
        thisHome.render(element);
    }

    render(element) {
        const generatedHTML = templates.home();
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        element.appendChild(generatedDOM);
    }

}

export default Home;