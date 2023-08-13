const express = require("express");
const { google } = require("googleapis");
const moment = require("moment");
const keys = require("./applying-pressure-388505-61bbc5c65b27.json");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const jwtClient = new google.auth.JWT({
  email: keys.client_email,
  key: keys.private_key,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

jwtClient.authorize((err, tokens) => {
  if (err) {
    console.error("Error during authorization:", err);
    return;
  }
  console.log("Authorization successful!");
});

async function sendMail({ to, subject, text }) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "obreezy1965@gmail.com",
      pass: "jzuhjiuyjhjffbtk",
    },
  });
  let info = await transporter.sendMail({
    from: '"Applying Pressure Mobile Detailing" <ApplyingPressure-noreply@gmail.com>',
    to: to,
    subject: subject,
    text: text,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

app.get("/events", async (req, res) => {
  const calendar = google.calendar({ version: "v3", auth: jwtClient });

  let response;
  try {
    response = await calendar.events.list({
      calendarId: "applyingpressureaq@gmail.com",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 9999,
    });
    console.log("Fetched events:", response.data.items);
    const events = response.data.items.map((event) => ({
      title: event.summary,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      description: event.description,
    }));
    res.json(events);
  } catch (err) {
    console.error("Error fetching events list:", err);
    res.status(500).send("Error fetching events list: " + err);
  }
});

app.post("/events", async (req, res) => {
  const {
    selectedDate,
    selectedTime,
    description,
    location,
    endTime,
    email,
    name,
    phoneNumber,
  } = req.body;
  if (!selectedDate || !selectedTime) {
    return res.status(400).json({
      success: false,
      message: "Invalid request: missing selectedDate or selectedTime",
    });
  }
  const calendar = google.calendar({ version: "v3", auth: jwtClient });

  try {
    const eventStartTime = moment(
      `${selectedDate} ${selectedTime}`,
      "MMMM D, YYYY h:mm A"
    ).add(4, "hours");

    const event = {
      summary: "This Omars testing",
      start: { dateTime: eventStartTime.toISOString() },
      end: { dateTime: new Date(endTime).toISOString() },
      description: description,
      location: location,
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "applyingpressureaq@gmail.com",
      resource: event,
    });

    console.log("Created event:", createdEvent.data);

    await sendMail({
      to: "omaraly185@gmail.com",
      subject: "Event Created Successfully",
      text: `Hi,
          Great news! Someone just booked one of your services.
        Here are the details:

        Customer Info
Name: ${name}
Email: ${email}
Phone Number: ${phoneNumber}
address:${location}
When:${selectedDate} ${selectedTime}
Does the vehicle have pet hair? (check if yes) : Yes
Please State any + Services you would like to get and anything else you would want us to know: 

`,
    });
    await sendMail({
      to: email,
      subject: "Event Created Successfully",
      text: `Hell Yeah`,
    });

    res
      .status(200)
      .json({ success: true, message: "Appointment created successfully" });
  } catch (err) {
    console.error("Error creating event:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create appointment" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
