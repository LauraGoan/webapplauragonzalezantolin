function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;    // el nombre de botons dins de l'element "menu"
    for (let i = 1; i < num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i == num_boto) {
            boto.style.color = "#950E17";    // es destaca la secció activa amb el canvi de colors del botó corresponent
            boto.style.backgroundColor = "#FCDEE0";
            seccio.style.display = "flex";    // es fa visible la secció activa
        }
        else {
            boto.style.color = "white";    // colors dels botons de seccions inactives
            boto.style.backgroundColor = "#950E17";
            seccio.style.display = "none";    // s'oculten les seccions inactives
        }
    }
    if (num_boto == 3) {    // si es prem el botó de la secció "Galeria"
        omple_llista();
    }
    if (num_boto == 4) {
        mapa.invalidateSize();
        if (typeof geoID === "undefined") {    // si encara no s'han obtingut les dades de localització del dispositiu
            navigator.geolocation.watchPosition(geoExit);    // inicia el seguiment de la localització del dispositiu
        }
    }
}

let validat = false;    // variable que permet saber si hi ha algun usuari validat
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbzh6L9OdL4D8HAklBcnP_dkuH26W26uJdfruIccHIMEn1oFsuIFiw8_sr_0W6F5KwhEfg/exec"    // s'ha de substituir la cadena de text per la URL del script

function inici_sessio() {
    nom = document.getElementById("nom_usuari").value;    // la propietat "value" d'un quadre de text correspon al text escrit per l'usuari
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&where=usuari&is=" + nom + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then((resposta) => {   // registres que contenen el nom d'usuari i contrasenya escrits per l'usuari
            return resposta.json();    // conversió a llista
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // llista buida
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            }
            else {    // llista amb (almenys) un registre
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();    // usuari validat, s'executen les instruccions del procediment "inicia_sessio"
            }
        });    
}

function inicia_sessio() {
    validat = true;    // usuari validat
    document.getElementById("seccio_0").style.display = "none";    // s'oculta la secció de validació d'usuaris
    canvia_seccio(1);    // es mostra la secció 1
}

function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + nom;    // primera consulta per saber si ja existeix algun usuari amb el nom escrit per l'usuari que es vol registrar
    fetch(consulta_1)
        .then((resposta) => {
            return resposta.json();
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // No hi ha cap altres usuari amb el mateix nom
                let consulta_2 = scriptURL + "?query=insert&values=" + nom + "$$" + contrasenya;    // segona consulta per registrar l'usuari nou
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {    // s'ha pogut afegir una registre en la base de dades
                            window.alert("S'ha completat el registre d'usuari.")
                            inicia_sessio();
                        }
                        else {    // no s'ha pogut afegir un registre en la base de dades
                            alert("S'ha produït un error en el registre d'usuari.")
                        }
                    })
            } 
            else {    // l'usuari ha de tornar-ho a intentar amb un nom diferent
                alert("Ja existeix un usuari amb aquest nom.");
            }
        });
}

function tanca_sessio() {
    location.reload();    // recàrrega de la pàgina, es reinicialitzen totes les variables
}
    
window.onload = () => { 
    let base_de_dades = storage.getItem("base_de_dades");   
    if(base_de_dades == null) {
        indexedDB.open("Dades").onupgradeneeded = event => {   
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex("Usuari_index", "Usuari");
        }    // les fotos es desen a la taula "Fotos"
        storage.setItem("base_de_dades","ok");
    }
    document.getElementById("obturador").addEventListener("change", function() {    // procediment que s'executa quan s'obté el fitxer de la foto realitzada (esdeveniment "change")
        if(this.files[0] != undefined) {    // instruccions que s'executen només si s'obté algun fitxer (només es processa el primer que es rebi)
            let canvas = document.getElementById("canvas");    // contenidor on es desa temporalment la imatge
            let context = canvas.getContext("2d");
            let imatge = new Image;
            imatge.src = URL.createObjectURL(this.files[0]);    // es crea la imatge a partir del fitxer
            imatge.onload = () => {    // procediment que s'executa un cop la imatge s'ha carregat en el contenidor
                canvas.width = imatge.width;
                canvas.height = imatge.height;                
                context.drawImage(imatge,0,0,imatge.width,imatge.height);    // es "dibuixa" la imatge en el canvas
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");    // la imatge es mostra en format jpg
                document.getElementById("icona_camera").style.display = "none";    // s'oculta la icona que hi havia abans de fer la foto
                document.getElementById("desa").style.display = "unset";    // es mostra el botó per desar la foto
            }
        }
    });
}

mapa = L.map("seccio_4").setView([41.72, 1.82], 8);    // assigna el mapa a la secció, centrat en el punt i amb el nivell de zoom
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {    // capa d'OpenStreetMap
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'    // autoria de la capa
}).addTo(mapa);    // s'afegeix la capa al mapa

indexedDB.open("Dades").onsuccess = event => {    // obertura de la base de dades "Dades" creada anteriorment 
    event.target.result.transaction("Vehicles", "readwrite").objectStore("Vehicles").add(nou_registre).onsuccess = () => {    // creació del nou registre en la taula "Vehicles"
    // espai per a les instruccions que s'executen un cop afegit el registre
    };
};

document.getElementById("obturador").addEventListener("change", function() {    // procediment que s'executa quan s'obté el fitxer de la foto realitzada (esdeveniment "change")
    if(this.files[0] != undefined) {    // instruccions que s'executen només si s'obté algun fitxer (només es processa el primer que es rebi)
        let canvas = document.getElementById("canvas");    // contenidor on es desa temporalment la imatge
        let context = canvas.getContext("2d");
        let imatge = new Image;
        imatge.src = URL.createObjectURL(this.files[0]);    // es crea la imatge a partir del fitxer
        imatge.onload = () => {    //

            
async function inicia_video() {
    const codi_model = "<div>Teachable Machine Image Model</div>
<button type="button" onclick="init()">Start</button>
<div id="webcam-container"></div>
<div id="label-container"></div>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"></script>
<script type="text/javascript">
    // More API functions here:
    // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

    // the link to your model provided by Teachable Machine export panel
    const URL = "./my_model/";

    let model, webcam, labelContainer, maxPredictions;

    // Load the image model and setup the webcam
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }
</script>
"   
    const tmURL = "https://teachablemachine.withgoogle.com/models/" + codi_model;
    const modelURL = tmURL + "/model.json";
    const metadataURL = tmURL + "/metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPrediccions = model.getTotalClasses();    // nombre de tipus d'imatges per reconèixer
    webcam = new tmImage.Webcam(300, 300, true);    // posada en marxa de la webcam
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);    // bucle
    document.getElementById("icona_video").style.display = "none";    // oculta la icona de la càmera de vídeo
    document.getElementById("coincidencia").style.display = "flex";    // mostra el text amb la predicció de coincidències
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    prediccions = document.getElementById("prediccions");
    for (let i = 0; i < maxPrediccions; i++) {
        prediccions.appendChild(document.createElement("div"));    // es crea un contenidor per a la coincidència de cada tipus d'imatge
    }
}
async function loop() {
    webcam.update();
    await prediu();
    window.requestAnimationFrame(loop);
}
async function prediu() {
    const prediccio = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPrediccions; i++) {
        const classe = prediccio[i].className + ": " + prediccio[i].probability.toFixed(2);    // es conserven dues xifres decimals
        prediccions.childNodes[i].innerHTML = classe;
    }
}
