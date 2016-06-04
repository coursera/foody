/* eslint-disable strict */
'use strict';
const moment = require('moment');

module.exports.setup = (router, db/* , auth */) => {
  router.get('/api/menu', (req, res) => {
    const offset = req.query.offset || 0;
    const items = req.query.items || 200;
    const from = req.query.from ? moment(req.query.from).format('YYYY-MM-DD') : null;
    const to = req.query.to ? moment(req.query.to).format('YYYY-MM-DD') : null;
    const withDishes = req.query.withDishes ? true : false;

    const restrictionSql = `select * from restriction`;
    const catererSql = `select * from caterer`;
    const mealSql = `select * from meal`;
    const params = {};

    let dishSql = `select
        dish.id,
        dish.served_on,
        dish.title,
        dish.description,
	      dish.meal,
        dish.caterer,
        group_concat(dish_to_restriction.restriction_id) as restrictions
      from dish
        left join caterer on caterer.id = dish.caterer
        left join meal on meal.id = dish.meal
        left join dish_to_restriction on dish_to_restriction.dish_id = dish.id`;

    if (from && to) {
      dishSql += ` where dish.served_on between $from and $to`;
      Object.assign(params, { $from: from, $to: to });
    }

    dishSql += ` group by dish.id order by dish.served_on desc, meal desc`;

    if (items) {
      dishSql += ` limit $items offset $offset`;
      Object.assign(params, { $items: items, $offset: offset });
    }

    Promise.all([
      withDishes ? db.getAll(dishSql, params) : null,
      db.getAll(restrictionSql),
      db.getAll(catererSql),
      db.getAll(mealSql),
    ]).then((results) => {
      const result = {
        restrictions: results[1],
        caterers: results[2],
        meals: results[3],
      };

      if (withDishes) {
        result.dishes = results[0];
      }

      res.json(result);
    }).catch((err) => {
      res.status(500).send(err);
    });
  });
};
