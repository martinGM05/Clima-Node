const fs = require('fs')

const axios = require('axios');


class Busquedas{

    historial = [];
    dbPath = './db/database.json'

    constructor(){
        this.leerBD();
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    get paramsMapbox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        } 
    }

    async ciudad(lugar = ''){
        try {
            //Petición http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });
            
            const resp = await intance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        
        } catch (error) {
            return [];
        }
    }

    get paramsWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        } 
    }

    async climaLugar(lat, lon){

        try {
            
            // instance axios.create()
            const intance = axios.create({
                // api.openweathermap.org/data/2.5/weather?lat=19.8178&lon=-97.3667&appid=9ea9eabe5073df4f393aba3e43093254&units=metric&lang=es
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}`,
                params: { ...this.paramsWeather, lat, lon}
            });
            // resp.data
            const resp = await intance.get();
            const {weather, main} = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial( lugar = ''){

        if(this.historial.includes(lugar.toLowerCase())){
            return;
        }
        this.historial = this.historial.splice(0, 5);
        this.historial.unshift(lugar.toLowerCase());

        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerBD(){
        if(!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }


}

module.exports = Busquedas;