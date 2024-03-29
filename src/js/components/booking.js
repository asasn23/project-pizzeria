import {select, settings, templates, classNames} from '../settings.js';
import {utils} from '../utils.js'
import AmountWidget from './amountwidget.js';
import DatePicker from './datepicker.js';
import HourPicker from './hourpicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.selected = {};
    }

    getData() {
        const thisBooking = this;
        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
        const params = {
            booking: [
                startDateParam,
                endDateParam,

            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        //console.log('getData params', params);
        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
            ])
            .then(function(allResponses){
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function([bookings, eventsCurrent, eventsRepeat]){
                //console.log(bookings);
                //console.log(eventsCurrent);
                //console.log(eventsRepeat);
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;
        thisBooking.booked = {};
        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat ){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        //console.log('thisBooking.booked', thisBooking.booked)
        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;
        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            )
            {
                table.classList.add(classNames.booking.tableBooked);
            } else{
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    render(element){
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.floorPlan = element.querySelector(select.booking.floorPlan);
        thisBooking.dom.bookingButton = element.querySelector(select.booking.bookingButton);
        thisBooking.dom.phone = element.querySelector(select.booking.phone);
        thisBooking.dom.address = element.querySelector(select.booking.address);
        thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function(){});
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){});
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.removeTables();
            thisBooking.updateDOM();
        });
        thisBooking.dom.floorPlan.addEventListener('click', function (event){
            thisBooking.initTables(event);
        });
        thisBooking.dom.bookingButton.addEventListener('click', function (event){
            event.preventDefault();
            thisBooking.sendBooking();
        });
    }

    removeTables() {
        const thisBooking = this;
     
        for (let table of thisBooking.dom.tables) {
            table.classList.remove(classNames.booking.tableSelected);
        }
    }

    initTables(event) {
        const thisBooking = this;
        const tableId = event.target.getAttribute('data-table');
        const isBooked = event.target.classList.contains(classNames.booking.tableBooked);
        const isSelected = event.target.classList.contains(classNames.booking.tableSelected);
        if(tableId) {
            if(isBooked) {
                alert('Table is unvaliable.');
            } else if(isSelected) {
                event.target.classList.remove(classNames.booking.tableSelected);
                thisBooking.selected = {};
            } else if (!isSelected) {
                thisBooking.removeTables();
                event.target.classList.add(classNames.booking.tableSelected);
                thisBooking.selected = tableId;
            }
        }
    }

    sendBooking() {
        const thisBooking = this;
        const url = settings.db.url + '/' + settings.db.bookings;
        const payload = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.hourPicker.value,
            table: parseInt(thisBooking.selected),
            duration: parseInt(thisBooking.hoursAmount.value),
            ppl: parseInt(thisBooking.peopleAmount.value),
            starters: [],
            phone: thisBooking.dom.phone.value,
            address: thisBooking.dom.address.value,
        };
    
        for (let starter of thisBooking.dom.starters) {

            if (starter.checked) {
                payload.starters.push(starter.value);
            }
        }
    
        const options = {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(payload)
        };

        fetch(url, options)
        .then(function (response) {
            return response.json();
        }).then(function (parsedResponse) {
            console.log('parsedResponse', parsedResponse);
            thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        });
    }
}

export default Booking;