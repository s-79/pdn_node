let db, config

// Le require() envoie une fonction envoyant la class Them
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Them
}

let Them = class {

    // Envoie une thématique via son ID
    static getByID(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM thematique WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined)
                        next(result[0])
                    else
                        next(new Error(config.errors.wrongID))
                })
                .catch((err) => next(err))

        })

    }

    // Envoie toutes les thématiques (avec un maximum optionnel)
    static getAll() {

        return new Promise((next) => {
            db.query('SELECT * FROM thematique')
                .then((result) => next(result))
                .catch((err) => next(err))
        })
    }

    // Ajoute une thématique avec son nom
    static add(nom) {

        return new Promise((next) => {

            if (nom != undefined && nom.trim() != '') {

                nom = nom.trim()

                db.query('SELECT * FROM thematique WHERE nom = ?', [nom])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.nameAlreadyTaken))
                        } else {
                            return db.query('INSERT INTO thematique(nom) VALUES(?)', [nom])
                        }
                    })
                    .then(() => {
                        return db.query('SELECT * FROM thematique WHERE nom = ?', [nom])
                    })
                    .then((result) => {
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

    // Modifie les données de la thématique via son ID
    static update(id, nom) {

        return new Promise((next) => {

            if (nom != undefined && nom.trim() != '') {

                nom = nom.trim()

                db.query('SELECT * FROM thematique WHERE id = ?', [id])
                    .then((result) => {
                        if (result[0] != undefined) {
                            return db.query('SELECT * FROM thematique WHERE nom = ? AND id != ?', [nom, id])
                        } else {
                            next(new Error(config.errors.wrongID))
                        }
                    })
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.sameName))
                        } else {
                            return db.query('UPDATE thematique SET nom = ? WHERE id = ?', [nom, id])
                        }
                    })
                    .then(() => next(true))
                    .catch((err) => next(err))

            } else {
                next(new Error(config.errors.noNameValue))
            }

        })

    }

    // Supprime une thematique via son ID
    static delete(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM thematique WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return db.query('DELETE FROM thematique WHERE id = ?', [id])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))

        })

    }

}
