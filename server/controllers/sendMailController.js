const nodemailer = require("nodemailer");
const con = require("../config/database");
require("dotenv").config();

const send_email_project_lead = async (req, res, next) => {
  let { username, taskName, appAcronym } = req.body;

  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const select_sql_accounts = `SELECT * FROM accounts`;
  con.query(select_sql_accounts, function (err, result) {
    if (err) throw err;
    else {
      let PL_email = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].groupName.includes("Project Lead")) {
          PL_email.push(result[i].email);
        }
      }

      console.log(PL_email);

      const select_sql_accounts_email = `SELECT * FROM accounts WHERE username = ?`;
      con.query(select_sql_accounts_email, [username], function (err, result) {
        if (err) throw err;
        else {
          let TM_email = result[0].email;

          for (let i = 0; i < PL_email.length; i++) {
            transport.sendMail({
              from: `${TM_email}`,
              to: `${PL_email[i]}`,
              subject: `Done Task: ${taskName} by ${username}`,
              html: `<div><h2>Done Task From <b>${username}</b></h2>
                  <p>Dear Sir/Madam, </p>
                  <p>My username is <b>${username}</b></p>
                  <p>Application: <b>${appAcronym}</b></p>
                  <p>I have completed the task <b>${taskName}</b> and it is <b>Done</b>. Please check it. Thank you!!</p>
                  <p>Yours sincerely, <br>${username}</p>
                  </div>`
            });
          }
        }
      });
    }
  });
};

module.exports = { send_email_project_lead };
