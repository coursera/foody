"use strict";

module.exports.setup = (router, db, auth) => {

  router.get('/api/caterer', auth, (req, res) => {
    const offset = req.query.offset || 0;
    const items = req.query.items || 10;
    const sql = `select * from caterer
      order by id desc
      limit $items
      offset $offset`;

    db.getAll(sql, { $items: items, $offset: offset * items })
      .then((caterers) => {
        res.json(caterers);
      }).catch((err) => {
        res.status(500).send(err);
      });
  });

  router.put('/api/caterer', auth, (req, res) => {
    const title = req.body.title || '';
    const website = req.body.website || '';
    const sql = 'insert into caterer (title, website) values ($title, $website)';
    const params = { $title: title, $website: website };

    db.run(sql, params).then((stats) => {
      res.send({ id: stats.lastID, title, website });
    }).catch((err) => {
      res.status(500).send(err);
    });
  });

  router.post('/api/caterer/:id', auth, (req, res) => {
    const title = req.body.title;
    const website = req.body.website;
    const id = req.params.id;

    if (title && website && id) {
      const sql = 'update caterer set title=$title, website=$website where id=$id';
      const params = { $title: title, $website: website, $id: id };

      db.run(sql, params).then((stats) => {
        if (stats.changes) {
          res.send({ id, title, website });
        } else {
          res.sendStatus(404);
        }
      }).catch((err) => {
        res.status(500).send(err);
      });
    } else {
      res.sendStatus(400);
    }
  });

  router.delete('/api/caterer', auth, (req, res) => {
    const ids = req.body.ids;
    const sql1 = 'select * from dish where caterer in (' + ids.map(() => '?').join(',') + ')';
    const sql2 = 'delete from caterer where id in (' + ids.map(() => '?').join(',') + ')';
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
          res.status(400).send(`you can't delete any caterers attached to existing dishes`);
        } else {
          res.status(500).send(err);
        }
      });
  });

  router.delete('/api/caterer/:id', auth, (req, res) => {
    const id = req.params.id;
    const sql1 = 'select * from dish where caterer=$caterer';
    const sql2 = 'delete from caterer where id=$id';
    const params = { $id: id };

    db.getAll(sql1, { $caterer: id })
      .then((dishes) => {
        if (dishes.length) {
          throw new Error('existing');
        }
        return db.run(sql2, params);
      }).then(() => {
        res.json({ id });
      }).catch((err) => {
        if (err.message === 'existing') {
          res.status(400).send(`you can't delete any caterers attached to existing dishes`);
        } else {
          res.status(500).send(err);
        }
      });
  });
};
