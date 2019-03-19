const express = require('express');
const PORT = process.env.PORT || 8080;

var app = express();

app.get('/',(req,res) => {

	res.send("Hadoop As A Service");
});

app.listen(PORT,() => {
	console.log(`Application started at ${PORT}`);
});