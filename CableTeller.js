function printout() {
	var cableType = document.getElementById("combo").value;
	var loLoss;
	var hiLoss;
	switch (cableType) {
		case "RG-6":
			loLoss = 1.4;
			hiLoss = 5.6;
			break;
		case "RG-59":
			loLoss = 3.3;
			hiLoss = 16.9;
			break;
		case "RG-11":
			loLoss = 1;
			hiLoss = 4.7;
			break;
	}
	var low;
	var high;
	var low2;
	var high2;
	low = parseFloat(document.getElementById("inLow").value);
	high = parseFloat(document.getElementById("inHigh").value);
	low2 = parseFloat(document.getElementById("outLow").value);
	high2 = parseFloat(document.getElementById("outHigh").value);
	document.getElementById("result").innerHTML = calculateLength(low, high, low2, high2, cableType, loLoss, hiLoss);
}

function calculateLength(l, h, l2, h2, cableType, loLoss, hiLoss) {
	if (isNaN(l) || isNaN(h) || isNaN(l2) || isNaN(h2)) {
		return "Please complete the form.";
	}
	var LOW_LOSS = loLoss;
	var HIGH_LOSS = hiLoss;
	var LOW_ERROR_MARGIN = 1;
	var HIGH_ERROR_MARGIN = 3;
	var cable = cableType;
	var output = "";
	var lowLost = l - l2;
	var hiLost = h - h2;
	if (lowLost <= 0 || hiLost <= 0) {
		output = ("End signal equal/higher than source.");
		return output;
	}
	var feet = 0;
	var lowRollOff = 0;
	var highRollOff = 0;
	var lowLength = (lowLost / (LOW_LOSS / 100.0));
	var highLength = (hiLost / (HIGH_LOSS / 100.0));
	if (lowLength < highLength) {
		feet = Math.round(lowLength);
		highRollOff = (highLength - lowLength) * (HIGH_LOSS / 100.0);
		if (highRollOff > HIGH_ERROR_MARGIN) {
			output += ("High frequency is at least " + Math.round(highRollOff) +
				" dB less than it should be. Possible bad drop.<br>" +
				"Based on the levels alone,<br>");
		}
	}
	if (highLength < lowLength) {
		feet = Math.round(highLength);
		lowRollOff = (lowLength - highLength) * (LOW_LOSS / 100.0);
		if (lowRollOff > LOW_ERROR_MARGIN) {
			output += "Low frequency issue.<br>";
			output += splitCheck(l - l2, h - h2, LOW_LOSS, HIGH_LOSS, LOW_ERROR_MARGIN, HIGH_ERROR_MARGIN, cable);
		}
	}
	if (highLength == lowLength) {
		feet = Math.round(lowLength);
	}
	output += ("This drop may be " + feet + " feet of " + cable + ".<br>");
	return output;
}

function splitCheck(l, h, L_L, H_L, L_E_M, H_E_M, c) {
	var text = "";
	var isFound = false;
	var cable = c;
	var s = 0;
	while (isFound == false) {
		s += 3.5;
		var splitterLow = l - s;
		var splitterHigh = h - s;
		if (splitterLow < 0 || splitterHigh < 0) {
			text += "No splitters calculated. <br>Look for defective connections.<br>Without any splitters,<br>";
			return text;
		}
		var splitFeet = 0;
		var splitLowLength = 0;
		var splitHighLength = 0;
		var splitLowRollOff = 0;
		var splitHighRollOff = 0;
		splitLowLength = (splitterLow / (L_L / 100.0));
		splitHighLength = (splitterHigh / (H_L / 100.0));
		if (splitLowLength < splitHighLength) {
			splitFeet = Math.round(splitLowLength);
			splitHighRollOff = (splitHighLength - splitLowLength) * (H_L / 100.0);
			if (splitHighRollOff > H_E_M) {
				isFound = true;
				text += "*Possible splitter*<br>";
				text += ("On a -" + s + " dB split, high frequency is about " + Math.round(splitHighRollOff) + " dB less than it should be.<br>");
				if (splitFeet != 0) {
					text += "Possible bad drop with " + splitFeet + " feet of " + cable + ".<br>";
				}
			} else {
				isFound = true;
				text += "*Possible splitter*<br>";
				if (splitFeet != 0) {
					text += ("On a -" + s + " dB split, this drop may be " + splitFeet +
						" feet of " + cable + ".<br>");
				}
			}
		}
		if (splitHighLength < splitLowLength) {
			splitFeet = Math.round(splitHighLength);
			splitLowRollOff = (splitLowLength - splitHighLength) * (L_L / 100.0);
			if (splitLowRollOff > L_E_M) {
				isFound = false;
			} else {
				isFound = true;
				text += "*Possible splitter*<br>";
				if (splitFeet != 0) {
					text += ("On a -" + s + " dB split, this drop may be " + splitFeet +
						" feet of " + cable + ".<br>");
				}
			}
		}
		if (splitHighLength == splitLowLength) {
			isFound = true;
			text += "*Possible splitter*<br>";
			splitFeet = Math.round(splitLowLength);
			if (splitFeet != 0) {
				text += ("On a -" + s + " dB split, this drop may be " + splitFeet +
					" feet of " + cable + ".<br>");
			}
		}
		if (s >= 14) {
			text += "No splitters calculated. <br>Look for defective connections.<br>Without any splitters,<br>";
			return text;
		}
	}
	text += "Without any splitters,<br>";
	return text;
}