let db, config

// Le require() envoie une fonction qui contient la class Outils
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Outils
}
// ---------------------------------------------------------------------------- ! ! !  - - R E A D - - ! ! !
let Outils = class {

    // ------------------------------------------------------------------------ Envoyer les données d'un outil via son ID
    static getByID(id) {

        return new Promise((next) => {
            db.query('SELECT * FROM outil WHERE id = ?', [id])
                .then((result) => {
                    //  S'il y a une ligne en résultat, on l'envoit
                    if (result[0] != undefined)
                        next(result[0])
                    else
                        next(new Error(config.errors.wrongID))
                })
                .catch((err) => next(err))
        })
    }

    // ------------------------------------------------------------------------- Envoyer l'id et le nom de tous les outils
    static getAll() {
        return new Promise((next) => {
            db.query('SELECT id, nom FROM outil ORDER BY nom')
                .then((result) => next(result))
                .catch((err) => next(err))
        })
    }

    // ------------------------------------------------------------------------- Récuperer les thématiques associer à un outil dans la table classer
    static getThemByID(id) {

        return new Promise((next) => {
            db.query('SELECT * FROM v_outil_them WHERE id = ?', [id])
                .then((result) => next(result))
                .catch((err) => next(err))
        })
    }

// ---------------------------------------------------------------------------- ! ! !  - - C R E A T E- - ! ! !

    // ------------------------------------------------------------------------ Ajouter un outil avec ses paramètres
    static add(nom, description, thematique1, thematique2, thematique3, thematique4, thematique5, image, fichier, age, nom_editeur, site_editeur, valide) {

        return new Promise((next) => {
            if (nom != undefined && nom.trim() != '') {
                nom = nom.trim()
                // Le nom de l'outil est-il déjà pris ?
                db.query('SELECT * FROM outil WHERE nom = ?', [nom])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.nameAlreadyTaken))
                        } else {
                            // Si valide = on, on remonte 1
                            valide === "on" ? valide = 1 : valide = 0
                            // Envoie des données vers la BDD
                            return db.query('INSERT INTO outil(nom, description, image, fichier, age, nom_editeur, site_editeur, valide) VALUES(?,?,?,?,?,?,?,?)', [nom, description, image, fichier, age, nom_editeur, site_editeur, valide])
                        }
                    })
                    .then(() => {
                        // Récupération de l'id de l'outil
                        return db.query('SELECT id FROM outil WHERE nom = ?', [nom])
                    })
                    .then((result) => {
                        const thems = [thematique1, thematique2, thematique3, thematique4, thematique5];
                        for (let them of thems) {
                            if (them) {
                                db.query('INSERT INTO classer VALUES(?,?)', [result[0].id, them])
                            }
                        }
                    })
                    .then(() => {
                        // Récupération des données de l'outil
                        return db.query('SELECT * FROM outil WHERE nom = ?', [nom])
                    })
                    .then((result) => {
                        // Envoie
                        next({
                            id: result[0].id,
                            nom: result[0].nom
                        })
                    })
                    .catch((err) => next(err))
            } else {
                next(new Error(config.errors.noNameValue))
            }
        })
    }

    // ------------------------------------------------------------------------- Associer des thématiques à une ressource déjà existante
    static addThem(id, thematique1, thematique2, thematique3, thematique4, thematique5) {

        return new Promise((next) => {
            const thems = [thematique1, thematique2, thematique3, thematique4, thematique5];
            for (let them of thems) {
                db.query('INSERT INTO classer VALUES(?,?)', [id, them])
                .then((result) => next(true))
                .catch((err) => next(err))
            }
        })
    }

// ---------------------------------------------------------------------------- ! ! !  - - U P D A T E - - ! ! !

    // ------------------------------------------------------------------------- Modifier les données de l'outil via son ID
    static update(id, nom, description, image, fichier, age, nom_editeur, site_editeur, valide) {

        return new Promise((next) => {
            if (nom != undefined && nom.trim() != '') {
                nom = nom.trim()
                // L'id existe-t-il dans la table outil ?
                db.query('SELECT * FROM outil WHERE id = ?', [id])
                    .then((result) => {
                        if (result[0] != undefined) {
                            // Est-ce qu'il existe un outil avec le même nom et un id différent ?
                            return db.query('SELECT * FROM outil WHERE nom = ? AND id != ?', [nom, id])
                        } else {
                            next(new Error(config.errors.wrongID))
                        }
                    })
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.sameName))
                        } else {
                            valide === "on" ? valide = 1 : valide = 0
                            // Envoie de l'update
                            return db.query('UPDATE outil SET nom = ?, description = ?, image = ?, fichier = ?, age = ?, nom_editeur = ?, site_editeur = ?, valide = ? WHERE id = ?', [nom, description, image, fichier, age, nom_editeur, site_editeur, valide, id])
                        }
                    })
                    .then(() => next(true))
                    .catch((err) => next(err))
            } else {
                next(new Error(config.errors.noNameValue))
            }
        })
    }

// ---------------------------------------------------------------------------- ! ! !  - - D E L E T E - - ! ! !

    // ------------------------------------------------------------------------- Supprimer un outil via son ID
    static delete(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM outil WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        // Supprimer d'abord l'association puis l'outil
                        return db.query('DELETE FROM classer WHERE id_outil = ?', [id]) && db.query('DELETE FROM outil WHERE id = ?', [id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))
        })
    }

    // ------------------------------------------------------------------------- Supprimer une association entre un outil et un ethématique dans la table classer
    static deleteClasser(id_outil, id_thematique) {

        return new Promise((next) => {

            db.query('SELECT * FROM classer WHERE id_outil = ? AND id_thematique = ?', [id_outil, id_thematique])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('DELETE FROM classer WHERE id_outil = ? AND id_thematique = ?', [id_outil, id_thematique])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))
        })
    }
}
