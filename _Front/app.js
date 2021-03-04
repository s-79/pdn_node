// Modules
/* Body Paser nécéssaire pour les requêtes post */
const bodyParser = require('body-parser')
/* Doc ExpressJS : https://expressjs.com/fr/ */
const express = require('express')
/* Morgan en mode dev pour le debugging nous permet de voir en console les infos sur les requêtes*/
const morgan = require('morgan')('dev')
/* Axios : éxécuter des requêtes http pour aller récupérer des données */
const axios = require('axios')
// Twig module utilisé en arrière plan par express
const twig = require('twig')

// Variables globales
const app = express()
const port = 8081
const fetch = axios.create({
/*    baseURL: 'http://localhost:8080/api/v1'*/
    // baseURL: 'http://192.168.1.40:8080/api/v1'
    baseURL: 'http://51.210.255.29:8080/api/v1'
});

// Middlewares
app.use(morgan)

// Permet de rendre les dossiers accessibles à l'app, notamment img et css
app.use(express.static('assets'));

/* Pour parser le json : https://expressjs.com/en/4x/api.html#req.body */
app.use(bodyParser.json())
/* Pour des tests dans Postman, se mettre dans body x-www-urlencoded */
app.use(bodyParser.urlencoded({ extended: true }))

// Routes

// Page d'accueil
app.get('/', (req, res) => {
    /* Redirection vers la page outil_Create */
    res.redirect('/outil_Create')
})

// ----------------------------------------------------------------------------- ! ! ! !  - - C R E A T E - - ! ! !

// ----------------------------------------------------------------------------- Récupérer toutes les thématiques pouvant être associées à un outil
app.get('/outil_Create', (req, res) => {
    apiCall('/outils/them', 'get', {}, res, (result) => {
        res.render('outil_Create.twig', {
            thematiques: result
        })
    })
})

// ----------------------------------------------------------------------------- Ajouter un outil et de l'associer à une thématique
app.post('/outil_Create', (req, res) => {
    apiCall('/outils', 'post', {
        nom: req.body.nom,
        description: req.body.description,
        thematique1: req.body.thematique1,
        thematique2: req.body.thematique2,
        thematique3: req.body.thematique3,
        thematique4: req.body.thematique4,
        thematique5: req.body.thematique5,
        image: req.body.image,
        fichier: req.body.fichier,
        age: req.body.age,
        nom_editeur: req.body.nom_editeur,
        site_editeur: req.body.site_editeur,
        valide: req.body.valide
    }, res, () => {
        res.redirect('/outil_Select')
    })
})

// ----------------------------------------------------------------------------- ! ! ! !  - - U P D A T E - - ! ! !

// ----------------------------------------------------------------------------- Afficher la liste de tous les outils modifiables
app.get('/outil_Select', (req, res) => {
    apiCall('/outils', 'get', {}, res, (result) => {
        res.render('outil_Select.twig', {
            outils: result
        })
    })
})

// ----------------------------------------------------------------------------- Récupérer les données de l'outil séléctionné
app.get('/outil_Update/:id', (req, res) => {
    apiCall('/outils/id/'+req.params.id, 'get', {}, res, (result) => {
        res.render('outil_Update.twig', {
            outil: result
        })
    })
})

// ----------------------------------------------------------------------------- Récupérer les thématiques associées à l'outil séléctionné
app.get('/outil_Select_Them/:id', (req, res) => {
    apiCall('/outils/classer/'+req.params.id, 'get', {}, res, (result) => {
        res.render('outil_Select_Them.twig', {
            classer: result
        })
    })
})

// ----------------------------------------------------------------------------- Récupérer toutes les thématiques pouvant être associées à un outil
app.get('/outil_Update_Them/:id', (req, res) => {
    apiCall('/outils/them', 'get', {}, res, (result) => {
        res.render('outil_Update_Them.twig', {
            thematiques: result
        })
    })
})

// ----------------------------------------------------------------------------- Ajouter des thématiques liées à la ressource dans la table classer
app.post('/outil_Update_Them/:id', (req, res) => {
    apiCall('/outils/classer/'+req.params.id, 'post', {
        thematique1: req.body.thematique1,
        thematique2: req.body.thematique2,
        thematique3: req.body.thematique3,
        thematique4: req.body.thematique4,
        thematique5: req.body.thematique5
    }, res, () => {
        res.redirect('/outil_Select')
    })
})

// ----------------------------------------------------------------------------- Modifier les associations dans la table classer
app.post('/outil_Update/:id', (req, res) => {
    apiCall('/outils/id/'+req.params.id, 'put', {
        nom: req.body.nom,
        description: req.body.description,
        image: req.body.image,
        fichier: req.body.fichier,
        age: req.body.age,
        nom_editeur: req.body.nom_editeur,
        site_editeur: req.body.site_editeur,
        valide: req.body.valide
    }, res, () => {
        res.redirect('/outil_Select_Them/'+req.params.id)
    })
})

// ----------------------------------------------------------------------------- Supprimer un outil et le dissocier de ses thématiques
app.post('/delete', (req, res) => {
    apiCall('/outils/id/'+req.body.id, 'delete', {}, res, () => {
        res.redirect('/outil_Select')
    })
})

// ----------------------------------------------------------------------------- Supprimer une association entre un outil et une thématique
app.post('/delete/:id', (req, res) => {
    apiCall('/outils/classer/'+req.params.id, 'delete', {
        id: req.body.id,
    }, res, () => {
        res.redirect('/outil_Select_Them/'+req.body.id)
    })
})

// ---------------------------------------------------------------------------- ! ! ! - - L A N C E M E N T  D E  L ' A P P L I C A T I O N - - ! ! !
app.listen(port, () => console.log('Started on port ' + port))


// ----------------------------------------------------------------------------- ! ! ! - - F O N C T I O N S - - ! ! !
function renderError(res, errMsg) {
    res.render('error.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, method, data, res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    }).then((response) => {
        if (response.data.status == 'success') {
            next(response.data.result)
        } else {
            renderError(res, response.data.message)
        }
    })
    .catch((err) => renderError(res, err.message))
}
