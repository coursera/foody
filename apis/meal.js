"use strict";
const moment = require('moment');

module.exports.setup = (router, db, auth) => {
  router.get('/api/meal', auth, (req, res) => {
    const offset = req.query.offset || 0;
    const items = req.query.items || 10;
    const sql = `select * from meal
      order by id desc
      limit $items
      offset $offset`;

    db.getAll(sql, { $items: items, $offset: offset * items })
      .then((types) => {
        res.json(types);
      }).catch((err) => {
        res.status(500).send(err);
      });
  });

  router.put('/api/meal', auth, (req, res) => {
    const title = req.body.title;
    const symbol = req.body.symbol || '';
    const start = moment(req.body.starttime).valueOf();
    const end = moment(req.body.endtime).valueOf();
    const required = req.body.required;

    if (title && start && end) {
      const sql = 'insert into meal (title, symbol, starttime, endtime, required) values ($title, $symbol, $starttime, $endtime, $required)';
      const params = { $title: title, $symbol: symbol, $starttime: start, $endtime: end, $required: required };

      db.run(sql, params).then((stats) => {
        res.send({ id: stats.lastID });
      }).catch((err) => {
        res.status(500).send(err);
      });
    } else {
      res.status(400).send('missing data');
    }
  });

  router.post('/api/meal/:id', auth, (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const symbol = req.body.symbol || '';
    const start = moment(req.body.starttime).valueOf();
    const end = moment(req.body.endtime).valueOf();
    const required = req.body.required;

    if (title && id && start && end) {
      const sql = 'update meal set title=$title, symbol=$symbol, starttime=$starttime, endtime=$endtime, required=$required where id=$id';
      const params = { $title: title, $symbol: symbol, $id: id, $starttime: start, $endtime: end, $required: required };

      db.run(sql, params).then(() => {
        res.send({ id });
      }).catch((err) => {
        res.status(500).send(err);
      });
    } else {
      res.status(400).send('missing data');
    }
  });

  router.delete('/api/meal', auth, (req, res) => {
    const ids = req.body.ids;
    const sql1 = 'select * from dish where meal in (' + ids.map(() => '?').join(',') + ')';
    const sql2 = 'delete from meal where id in (' + ids.map(() => '?').join(',') + ')';
    const params = ids;

    db.getAll(sql1, params)
      .then((dishes) => {
        if (dishes.length) {
          throw new Error('existing');
        }
        return db.run(sql2, params);
      }).then(() => {
        res.json(ids);
      }).catch((err) => {
        if (err.message === 'existing') {
          res.status(400).send(`you can't delete any meal types attached to existing dishes`);
        } else {
          res.status(500).send(err);
        }
      });
  });

  router.delete('/api/meal/:id', auth, (req, res) => {
    const id = req.params.id;
    const sql1 = 'select * from dish where meal=$meal';
    const sql2 = 'delete from meal where id=$id';
    const params = { $id: id };

    db.getAll(sql1, { $meal: id })
      .then((dishes) => {
        if (dishes.length) {
          throw new Error('existing');
        }
        return db.run(sql2, params);
      }).then(() => {
        res.json({ id });
      }).catch((err) => {
        if (err.message === 'existing') {
          res.status(400).send(`you can't delete any meal types attached to existing dishes`);
        } else {
          res.status(500).send(err);
        }
      });
  });
};
