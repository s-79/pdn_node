const {checkAndChange} = require('./assets/functions')
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')('dev')
const config = require('./assets/config')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {

    console.log('Connected.')

    const app = express()

    let OutilsRouter = express.Router()
    let Outils = require('./assets/classes/outils')(db, config)
    let Them = require('./assets/classes/them')(db, config)
    let Cat = require('./assets/classes/cat')(db, config)

    app.use(morgan)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // ------------------------------------------------------------------------ ! ! ! - - ROUTE /id - - ! ! !
    OutilsRouter.route('/id/:id')
        // -------------------------------------------------------------------- Récupèrer un outil avec son ID
        .get(async (req, res) => {
            let outil = await Outils.getByID(req.params.id)
            res.json(checkAndChange(outil))
        })

        // -------------------------------------------------------------------- Modifier un outil avec ID
        .put(async (req, res) => {
            let updateOutil = await Outils.update(
                req.params.id,
                req.body.nom,
                req.body.description,
                req.body.image,
                req.body.fichier,
                req.body.age,
                req.body.nom_editeur,
                req.body.site_editeur,
                req.body.valide
            )
            res.json(checkAndChange(updateOutil))
        })

        // -------------------------------------------------------------------- Supprimer un outil avec ID
        .delete(async (req, res) => {
            let deleteOutil = await Outils.delete(req.params.id)
            res.json(checkAndChange(deleteOutil))
        })

    // ------------------------------------------------------------------------ ! ! ! - - ROUTE / - - ! ! !
    OutilsRouter.route('/')
        // -------------------------------------------------------------------- Récupèrer tous les outils
        .get(async (req, res) => {
            let allOutils = await Outils.getAll()
            res.json(checkAndChange(allOutils))
        })

        //---------------------------------------------------------------------- Ajouter un outil avec ses paramètres
        .post(async (req, res) => {
            let addOutil = await Outils.add(
                req.body.nom,
                req.body.description,
                req.body.thematique1,
                req.body.thematique2,
                req.body.thematique3,
                req.body.thematique4,
                req.body.thematique5,
                req.body.image,
                req.body.fichier,
                req.body.age,
                req.body.nom_editeur,
                req.body.site_editeur,
                req.body.valide
            )
            res.json(checkAndChange(addOutil))
        })

    // ------------------------------------------------------------------------ ! ! ! - - ROUTE /them - - ! ! !
    OutilsRouter.route('/them')
        // ---------------------------------------------------------------- Récupèrer toutes les thématiques
        .get(async (req, res) => {
            let allThem = await Them.getAll()
            res.json(checkAndChange(allThem))
        })

        //------------------------------------------------------------------ Ajouter une thématique avec ses paramètres
        .post(async (req, res) => {
            let addThem = await Them.add(
                req.body.nom,
                req.body.categorie
            )
            res.json(checkAndChange(addThem))
        })

    OutilsRouter.route('/them/id/:id')
        // -------------------------------------------------------------------- Récupèrer une thématique avec son ID
        .get(async (req, res) => {
            let them = await Them.getByID(req.params.id)
            res.json(checkAndChange(them))
        })

        // -------------------------------------------------------------------- Modifier une thématique avec ID
        .put(async (req, res) => {
            let updateThem = await Them.updateNom(
                req.params.id,
                req.body.nom,
                req.body.categorie
            )
            res.json(checkAndChange(updateThem))
        })

        // -------------------------------------------------------------------- Supprimer une thématique avec ID
        .delete(async (req, res) => {
            let deleteThem = await Them.delete(req.params.id)
            res.json(checkAndChange(deleteThem))
        })

    OutilsRouter.route('/cat/them/id/:id')
        // -------------------------------------------------------------------- Modifier la catégorie d'une thématique avec son id
        .put(async (req, res) => {
            let updateThem = await Them.updateCat(
                req.params.id,
                req.body.categorie
            )
            res.json(checkAndChange(updateThem))
        })


    // ------------------------------------------------------------------------- ! ! ! - - ROUTE /cat - - ! ! !
    OutilsRouter.route('/cat')
        // -------------------------------------------------------------------- Récupèrer toutes les catégories
        .get(async (req, res) => {
            let allCat = await Cat.getAll()
            res.json(checkAndChange(allCat))
        })

        //---------------------------------------------------------------------- Ajouter une catégorie avec son icone
        .post(async (req, res) => {
            let addOutil = await Cat.add(
                req.body.nom,
                req.body.icone
            )
            res.json(checkAndChange(addOutil))
        })

    OutilsRouter.route('/cat/id/:id')
        // -------------------------------------------------------------------- Récupèrer une thématique avec son ID
        .get(async (req, res) => {
            let cat = await Cat.getByID(req.params.id)
            res.json(checkAndChange(cat))
        })

        // -------------------------------------------------------------------- Modifier une thématique avec ID
        .put(async (req, res) => {
            let updateCat = await Cat.update(
                req.params.id,
                req.body.nom,
                req.body.icone
            )
            res.json(checkAndChange(updateCat))
        })

        // -------------------------------------------------------------------- Supprimer une thématique avec ID
        .delete(async (req, res) => {
            let deleteCat = await Cat.delete(req.params.id)
            res.json(checkAndChange(deleteCat))
        })

    // ------------------------------------------------------------------------ ! ! ! - - ROUTE /classer - - ! ! !
    OutilsRouter.route('/classer/:id')
        // -------------------------------------------------------------------- Récupèrer les thématqiues liées à un outil avec l'ID de l'outil
        .get(async (req, res) => {
            let themByOutil = await Outils.getThemByID(req.params.id)
            res.json(checkAndChange(themByOutil))
        })

        //---------------------------------------------------------------------- Associer les thématiques à l'outil dans la table classer
        .post(async (req, res) => {
            let addThem = await Outils.addThem(
                req.params.id,
                req.body.thematique1,
                req.body.thematique2,
                req.body.thematique3,
                req.body.thematique4,
                req.body.thematique5
            )
            res.json(checkAndChange(addThem))
        })

        // -------------------------------------------------------------------- Supprimer l'association entre 1 thématique et 1 outil avec leurs ID
        .delete(async (req, res) => {
            let deleteClasser = await Outils.deleteClasser(
                req.body.id,
                req.params.id
                )
            res.json(checkAndChange(deleteClasser))
        })

    app.use(config.rootAPI+'outils', OutilsRouter)

    app.listen(config.port, () => console.log('Started on port '+config.port))

}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})
