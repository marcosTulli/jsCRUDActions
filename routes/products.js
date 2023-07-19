var express = require('express');
var router = express.Router();
const qs = require('qs');

const path = {
  products: 'products',
  id: 'id',
  search: 'search',
  detailSearch: 'detailSearch',
};

module.exports = function (db) {
  const getDb = db.get(`${path.products}`);

  router
    .route(`/${path.products}`)
    .get((req, res) => {
      res.send(db.get(`${path.products}`).value());
    })
    .post((req, res) => {
      const newProduct = req.body;
      res.send(db.get(`${path.products}`).insert(newProduct).write());
    });

  router.route(`/${path.products}/${path.search}`).get((req, res) => {
    const keywords = String(req.query.keywords.toLowerCase());
    const result = db.get(`${path.products}`).filter((_) => {
      const fullText =
        String(_.description).toLowerCase() +
        String(_.name).toLowerCase() +
        String(_.color).toLowerCase();
      return fullText.indexOf(keywords) !== -1;
    });

    res.send(result);
  });

  router.route(`/${path.products}/${path.detailSearch}`).get((req, res) => {
    const query = qs.parse(req.query);

    const results = db.get(`${path.products}`).filter((_) => {
      return Object.keys(query).reduce((found, key) => {
        const obj = query[key];
        // found = found && String(_[key]).toLowerCase() == obj.val.toLowerCase();
        switch (obj.op) {
          case 'lt':
            found = found && _[key] < obj.val;
            break;
          case 'eq':
            found = found && _[key] == obj.val;
            break;
          default:
            found && _[key].indexOf(obj.val) !== -1;
            break;
        }
        return found;
      }, true);
    });

    res.send(results);
  });

  router
    .route(`/${path.products}/:${path.id}`)
    .patch((req, res) => {
      res.send(
        db
          .get(`${path.products}`)
          .find({ id: req.params.id })
          .assign(req.body)
          .write()
      );
    })
    .delete((req, res) => {
      db.get(`${path.products}`).remove({ id: req.params.id }).write();
      res.status(204).send();
    })
    .get((req, res) => {
      // res.send(db.get('products').find({ id: req.params.id }).value());
      const result = db
        .get(`${path.products}`)
        .find({ id: req.params.id })
        .value();
      if (result) {
        res.send(result);
      } else {
        res.status(404).send();
      }
    });

  return router;
};
