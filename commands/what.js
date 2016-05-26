/* eslint-disable camelcase, strict */
'use strict';

const Message = require('../slack/message');
const Command = require('../slack/command');
const emojis = require('../data/emojis');
const moment = require('moment-timezone');

const matcher = (command) => {
  const what = /^what(\s+is|'s|\s+will)\s+/.test(command);
  const when = /^when(\s+is|'s|\s+will)\s+/.test(command);
  const words = command.split(' ').length;
  return words.length <= 7 && (what || when);
};

const what = new Command(matcher, (slack, db, config) => {
  const command = slack.text || '';
  const mealSql = 'select * from meal';
  const restrictionsSql = 'select * from restriction';
  const catererSql = 'select * from caterer';
  const dishesSql = `select
      dish.id,
      dish.served_on,
      dish.title,
      dish.description,
	    dish.meal,
      dish.caterer,
      group_concat(dish_to_restriction.restriction_id) as restrictions
    from dish
      left join dish_to_restriction on dish.id = dish_to_restriction.dish_id
    where dish.served_on = $whereDate and dish.meal = $mealId group by dish.id`;

  return new Promise((resolve /* , reject */) => {
    db.getAll(mealSql).then(meals => {
      const foundMeal = meals.findIndex(one => (new RegExp(one.title, 'i')).test(command));
      const days = moment.weekdays().concat('today', 'tomorrow', 'yesterday');
      const foundTime = days.findIndex(one => (new RegExp(one + '|' + one.replace('day', '?') + '|' + one.substring(0, 3), 'i')).test(command));

      if (foundMeal !== -1) {
        const date = moment().tz('America/Los_Angeles');

        if (foundTime > -1) {
          if (foundTime < 7) {
            date.day(days[foundTime]);
          } else if (foundTime === 8) {
            date.add(1, 'day');
          } else if (foundTime === 9) {
            date.subtract(1, 'day');
          }
        }

        const dishesParams = { $whereDate: date.format('Y-MM-D'), $mealId: meals[foundMeal].id };

        Promise.all([
          db.getAll(restrictionsSql),
          db.getAll(catererSql),
          db.getAll(dishesSql, dishesParams),
        ]).then(results => {
          const restrictions = results[0];
          const caterers = results[1];
          const dishes = results[2];

          console.log(restrictions, caterers, dishes);

          let message;

          if (dishes.length) {
            const meal = meals.find(one => one.id === dishes[0].meal);
            const caterer = caterers.find(one => one.id === dishes[0].caterer);
            const catererLink = `<${caterer.website}|${caterer.title}>`;
            const mealTime = `${moment(meal.starttime).format('h:mm a')} - ${moment(meal.endtime).format('h:mm a')}`;
            const mealLink = `<${config.www.url}/menu/${date.week()}|${date.format('dddd')}'s>`;
            const text = `${mealLink} ${meal.title} (${mealTime}) is brought to you by ${catererLink}`;

            message = new Message(text);

            dishes.map((dish) => {
              let emojified_description = dish.description;
              let emojified_title = dish.title;

              emojis.map((_emoji) => {
                const emoji = _emoji.replace(/([+-])/g, '\\\\$1');
                emojified_description = emojified_description.replace(new RegExp(`(\\s+|^)${emoji}(\\s+|$)`, 'igm'), ` :${emoji}: `);
                emojified_title = emojified_title.replace(new RegExp(`(\\s+|^)${emoji}(\\s+|$)`, 'igm'), ` :${emoji}: `);
              });

              const attachment = { title: emojified_title };

              if (dish.restrictions) {
                const dishRestrictions = dish.restrictions.split(',').map(id => parseInt(id, 10));
                const restriction = restrictions.filter(one => dishRestrictions.indexOf(one.id) !== -1);
                const titleRestrictions = restriction.map(one => one.title).join(', ');

                attachment.fields = [{ title: 'Diets', value: titleRestrictions, short: true }];
                attachment.color = restriction[0].color;
              } else {
                attachment.color = '#3F5E9D';
              }

              if (dish.description) {
                attachment.text = emojified_description;
              }

              message.addAttachment(attachment);
            });
          } else {
            message = new Message(`there will be no ${meals[foundMeal].title} provided on ${date.format('dddd')}`);
          }

          resolve(message);
        }).catch((err) => {
          resolve(new Message(err.toString()));
        });
      } else {
        const badText = `sorry, i don't understand what you want. try again?`;
        resolve(new Message(badText));
      }
    }).catch(err => {
      resolve(new Message(err.toString()));
    });
  });
});

what.setHelp('[what is for] ... on ... ?', 'find out what is for (lunch, dinner, breakfast, etc) on (today, tomorrow, Mon-Fri)');
what.setDefault(true);

module.exports = what;
