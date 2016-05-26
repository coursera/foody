"use strict";

module.exports.setup = (router, db, auth) => {
  router.get('/api/restriction', auth, (req, res) => {
    const offset = req.query.offset || 0;
    const items = req.query.items || 10;
    const sql = `select * from restriction
      order by id desc
      limit $items
      offset $offset`;

    db.getAll(sql, { $items: items, $offset: offset * items })
      .then((types) => {
        res.json(types);
      }).catch((err) => {
        res.status(500, err);
      });
  });

  router.put('/api/restriction', auth, (req, res) => {
    const title = req.body.title;
    const color = req.body.color || '#FFFFFF';

    if (title && color) {
      const sql = 'insert into restriction (title, color) values ($title, $color)';
      const params = { $title: title, $color: color };

      db.run(sql, params).then((stats) => {
        res.send({ id: stats.lastID });
      }).catch((err) => {
        res.status(500).send(err);
      });
    } else {
      res.status(400).send('need a title and a color');
    }
  });

  router.post('/api/restriction/:id', auth, (req, res) => {
    const title = req.body.title;
    const color = req.body.color || '#FFFFFF';
    const id = req.params.id;

    if (title && id && color) {
      const sql = 'update restriction set title=$title, color=$color where id=$id';
      const params = { $title: title, $color: color, $id: id };

      db.run(sql, params).then(() => {
        res.send({ id });
      }).catch((err) => {
        res.status(500).send(err);
      });
    } else {
      res.status(400).send('need a title and a color');
    }
  });

  router.delete('/api/restriction', auth, (req, res) => {
    const ids = req.body.ids;
    const sql1 = 'select * from dish_to_restriction where restriction_id in (' + ids.map(() => '?').join(',') + ')';
    const sql2 = 'delete from restriction where id in (' + ids.map(() => '?').join(',') + ')';
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

  router.delete('/api/restriction/:id', auth, (req, res) => {
    const id = req.params.id;
    const sql1 = 'select * from dish_to_restriction where restriction_id=$restriction';
    const sql2 = 'delete from restriction where id=$id';
    const params = { $id: id };

    db.getAll(sql1, { $restriction: id })
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
