/* eslint-disable camelcase, strict */
'use strict';

const Message = require('../slack/message');
const Command = require('../slack/command');
const response = require('../slack/response');
const emojis = require('../data/emojis');
const moment = require('moment-timezone');

const matcher = (command) => {
  const what = /^what(\s+is|'s|\s+will)\s+/.test(command);
  const when = /^when(\s+is|'s|\s+will)\s+/.test(command);
  const words = command.split(' ').length;
  return words.length <= 7 && (what || when);
};

const mode = (_arr, field) => {
  const arr = _arr.concat();
  return arr.sort((a, b) =>
    arr.filter(v => v[field] === a[field]).length - arr.filter(v => v[field] === b[field]).length
  ).pop()[field];
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
  const dishesTimeSql = `select
      dish.title,
      dish.meal,
      meal.title,
      meal.endtime
    from dish
      left join meal on dish.meal = meal.id
    where dish.served_on = $whereDate group by dish.meal`;

  moment.tz.setDefault('America/Los_Angeles');

  return new Promise((resolve /* , reject */) => {
    db.getAll(mealSql).then(meals => {
      const foundMeal = meals.findIndex(one => (new RegExp(one.title, 'i')).test(command));
      const days = moment.weekdays().concat(['today', 'tomorrow', 'yesterday']);
      const foundTime = days.findIndex(one => (new RegExp(one + '|' + one.substring(0, 4) + '|' + one.substring(0, 3), 'i')).test(command));
      const wordsLength = command.split(' ').length;

      const date = moment();

      if (foundTime > -1) {
        if (foundTime < 7) {
          date.day(days[foundTime]);
        } else if (foundTime === 8) {
          date.add(1, 'day');
        } else if (foundTime === 9) {
          date.subtract(1, 'day');
        }
      }

      if (foundMeal !== -1 && wordsLength <= 7) {
        const dishesParams = { $whereDate: date.format('Y-MM-DD'), $mealId: meals[foundMeal].id };
        resolve(new Message('let me see what i can find ...'));

        Promise.all([
          db.getAll(restrictionsSql),
          db.getAll(catererSql),
          db.getAll(dishesSql, dishesParams),
        ]).then(results => {
          const restrictions = results[0];
          const caterers = results[1];
          const dishes = results[2];

          let message;

          if (dishes.length) {
            const meal = meals.find(one => one.id === dishes[0].meal);
            const caterer = caterers.find(one => one.id === mode(dishes, 'caterer'));
            const catererLink = `<${caterer.website}|${caterer.title}>`;
            const mealTime = `${moment(meal.starttime).format('h:mm a')} - ${moment(meal.endtime).format('h:mm a')}`;
            const mealLink = `<${config.www.url}/${config.www.base}/menu/${date.week()}|${date.format('dddd')}'s>`;
            const text = `${mealLink} ${meal.title} (${mealTime}) is brought to you by ${catererLink}`;

            message = new Message(text);

            dishes.map((dish) => {
              let emojified_description = dish.description || '';
              let emojified_title = dish.title || '';

              emojis.map((_emoji) => {
                const emoji = _emoji.replace(/([+-])/g, '\\\\$1');
                emojified_description = emojified_description.replace(new RegExp(`('|"|;|,|\\s+|^)${emoji}('|"|\\s+|,|;|$)`, 'igm'), ` :${emoji}: `);
                emojified_title = emojified_title.replace(new RegExp(`('|"|;|,|\\s+|^)${emoji}('|"|;|,|\\s+|$)`, 'igm'), ` :${emoji}: `);
              });

              const attachment = {
                text: '*' + emojified_title.trim() + '*',
                mrkdwn_in: ['text'],
              };

              if (dish.restrictions) {
                const dishRestrictions = dish.restrictions.split(',').map(id => parseInt(id, 10));
                const restriction = restrictions.filter(one => dishRestrictions.indexOf(one.id) !== -1);
                const titleRestrictions = restriction.map(one => one.title.split(' ').map(word => word[0]).join('')).join(', ');
                attachment.color = restriction[0].color;
                attachment.text += ' _(' + titleRestrictions + ')_';
              } else {
                attachment.color = '#3F5E9D';
              }

              if (dish.description) {
                attachment.text += '\n' + emojified_description.trim();
              }

              message.addAttachment(attachment);
            });
          } else {
            message = new Message(`there will be no ${meals[foundMeal].title} provided on ${date.format('dddd')}`);
          }

          response.sendTo(slack.user_name, message, config.slack);
        }).catch((err) => {
          response.sendTo(slack.user_name, new Message(err.toString()), config.slack);
        });
      } else if (foundTime !== -1 && wordsLength === 1) {
        db.getAll(dishesTimeSql, { $whereDate: date.format('Y-MM-DD') })
          .then(mealGroup => {
            let verb;
            const past = date.isBefore(moment().format('Y-MM-DD'));

            if (past) {
              verb = mealGroup.length > 1 || mealGroup.length === 0 ? 'were' : 'was';
            } else {
              verb = 'will be';
            }

            if (mealGroup.length) {
              const allMeals = mealGroup.map(meal => meal.title).join(', ');
              resolve(new Message(`${allMeals} ${verb} provided on ${date.format('dddd')}`));
            } else {
              resolve(new Message(`no meals ${verb} provided on ${date.format('dddd')}`));
            }
          }).catch(err => {
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

what.setHelp('(lunch, dinner, breakfast, happy hour) [today, tomorrow, mon, tue, wed, thur, fri]', 'find out what is for (lunch, dinner, breakfast, happy hour) on any day of the week!');
what.setDefault(true);

module.exports = what;
