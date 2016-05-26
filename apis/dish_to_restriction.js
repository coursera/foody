"use strict";

module.exports.setup = (router, db, auth) => {
  router.get('/api/dish_to_restriction/:id', auth, (req, res) => {
    const dish_id = req.params.id;
    db.getAll(`select * from dish_to_restriction where dish_id=${dish_id}`).then((types) => {
      res.json(types);
    }).catch((err) => {
      res.status(500, err);
    });
  });
}
