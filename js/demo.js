// sample data for Structured-Filter demo

// code: https://github.com/evoluteur/structured-filter
// demo: http://evoluteur.github.io/structured-filter

var version = "1.13.2";

var contacts = [
  { id: "lastname", type: "text", label: "Lastname" },
  { id: "firstname", type: "text", label: "Firstname" },
  { id: "active", type: "boolean", label: "Is active" },
  { id: "age", type: "number", label: "Age" },
  {
    id: "category",
    type: "list",
    label: "Category",
    list: [
      { id: "1", label: "Family" },
      { id: "2", label: "Friends" },
      { id: "3", label: "Business" },
      { id: "4", label: "Acquaintances" },
      { id: "5", label: "Other" },
    ],
  },
  { id: "bday", type: "date", label: "Birthday" },
  { id: "phone", type: "text", label: "Phone" },
  { id: "cell", type: "text", label: "Mobile" },
  { id: "address", type: "text", label: "Address" },
  { id: "city", type: "text", label: "City" },
  {
    type: "list",
    id: "State",
    label: "State",
    list: [
      { id: "AL", label: "Alabama" },
      { id: "AK", label: "Alaska" },
      { id: "AZ", label: "Arizona" },
      { id: "AR", label: "Arkansas" },
      { id: "CA", label: "California" },
      { id: "CO", label: "Colorado" },
      { id: "CT", label: "Connecticut" },
      { id: "DE", label: "Delaware" },
      { id: "DC", label: "District of Columbia" },
      { id: "FL", label: "Florida" },
      { id: "GA", label: "Georgia" },
      { id: "HI", label: "Hawaii" },
      { id: "ID", label: "Idaho" },
      { id: "IL", label: "Illinois" },
      { id: "IN", label: "Indiana" },
      { id: "IA", label: "Iowa" },
      { id: "KS", label: "Kansas" },
      { id: "KY", label: "Kentucky" },
      { id: "LA", label: "Louisiana" },
      { id: "ME", label: "Maine" },
      { id: "MD", label: "Maryland" },
      { id: "MA", label: "Massachusetts" },
      { id: "MI", label: "Michigan" },
      { id: "MN", label: "Minnesota" },
      { id: "MS", label: "Mississippi" },
      { id: "MO", label: "Missouri" },
      { id: "MT", label: "Montana" },
      { id: "NE", label: "Nebraska" },
      { id: "NV", label: "Nevada" },
      { id: "NH", label: "New Hampshire" },
      { id: "NJ", label: "New Jersey" },
      { id: "NM", label: "New Mexico" },
      { id: "NY", label: "New York" },
      { id: "NC", label: "North Carolina" },
      { id: "ND", label: "North Dakota" },
      { id: "OH", label: "Ohio" },
      { id: "OK", label: "Oklahoma" },
      { id: "OR", label: "Oregon" },
      { id: "PA", label: "Pennsylvania" },
      { id: "RI", label: "Rhode Island" },
      { id: "SC", label: "South Carolina" },
      { id: "SD", label: "South Dakota" },
      { id: "TN", label: "Tennessee" },
      { id: "TX", label: "Texas" },
      { id: "UT", label: "Utah" },
      { id: "VT", label: "Vermont" },
      { id: "VA", label: "Virginia" },
      { id: "WA", label: "Washington" },
      { id: "WV", label: "West Virginia" },
      { id: "WI", label: "Wisconsin" },
      { id: "WY", label: "Wyoming" },
    ],
  },
  { id: "zip", type: "text", label: "Zip" },
  {
    id: "country",
    type: "list",
    label: "Country",
    list: [
      { label: "Afghanistan", id: "AF" },
      { label: "Åland Islands", id: "AX" },
      { label: "Albania", id: "AL" },
      { label: "Algeria", id: "DZ" },
      { label: "American Samoa", id: "AS" },
      { label: "Andorra", id: "AD" },
      { label: "Angola", id: "AO" },
      { label: "Anguilla", id: "AI" },
      { label: "Antarctica", id: "AQ" },
      { label: "Antigua and Barbuda", id: "AG" },
      { label: "Argentina", id: "AR" },
      { label: "Armenia", id: "AM" },
      { label: "Aruba", id: "AW" },
      { label: "Australia", id: "AU" },
      { label: "Austria", id: "AT" },
      { label: "Azerbaijan", id: "AZ" },
      { label: "Bahamas", id: "BS" },
      { label: "Bahrain", id: "BH" },
      { label: "Bangladesh", id: "BD" },
      { label: "Barbados", id: "BB" },
      { label: "Belarus", id: "BY" },
      { label: "Belgium", id: "BE" },
      { label: "Belize", id: "BZ" },
      { label: "Benin", id: "BJ" },
      { label: "Bermuda", id: "BM" },
      { label: "Bhutan", id: "BT" },
      { label: "Bolivia", id: "BO" },
      { label: "Bosnia and Herzegovina", id: "BA" },
      { label: "Botswana", id: "BW" },
      { label: "Bouvet Island", id: "BV" },
      { label: "Brazil", id: "BR" },
      { label: "British Indian Ocean Territory", id: "IO" },
      { label: "Brunei Darussalam", id: "BN" },
      { label: "Bulgaria", id: "BG" },
      { label: "Burkina Faso", id: "BF" },
      { label: "Burundi", id: "BI" },
      { label: "Cambodia", id: "KH" },
      { label: "Cameroon", id: "CM" },
      { label: "Canada", id: "CA" },
      { label: "Cape Verde", id: "CV" },
      { label: "Cayman Islands", id: "KY" },
      { label: "Central African Republic", id: "CF" },
      { label: "Chad", id: "TD" },
      { label: "Chile", id: "CL" },
      { label: "China", id: "CN" },
      { label: "Christmas Island", id: "CX" },
      { label: "Cocos (Keeling) Islands", id: "CC" },
      { label: "Colombia", id: "CO" },
      { label: "Comoros", id: "KM" },
      { label: "Congo", id: "CG" },
      { label: "Congo, The Democratic Republic of the", id: "CD" },
      { label: "Cook Islands", id: "CK" },
      { label: "Costa Rica", id: "CR" },
      { label: "Cote D'Ivoire", id: "CI" },
      { label: "Croatia", id: "HR" },
      { label: "Cuba", id: "CU" },
      { label: "Cyprus", id: "CY" },
      { label: "Czech Republic", id: "CZ" },
      { label: "Denmark", id: "DK" },
      { label: "Djibouti", id: "DJ" },
      { label: "Dominica", id: "DM" },
      { label: "Dominican Republic", id: "DO" },
      { label: "Ecuador", id: "EC" },
      { label: "Egypt", id: "EG" },
      { label: "El Salvador", id: "SV" },
      { label: "Equatorial Guinea", id: "GQ" },
      { label: "Eritrea", id: "ER" },
      { label: "Estonia", id: "EE" },
      { label: "Ethiopia", id: "ET" },
      { label: "Falkland Islands (Malvinas)", id: "FK" },
      { label: "Faroe Islands", id: "FO" },
      { label: "Fiji", id: "FJ" },
      { label: "Finland", id: "FI" },
      { label: "France", id: "FR" },
      { label: "French Guiana", id: "GF" },
      { label: "French Polynesia", id: "PF" },
      { label: "French Southern Territories", id: "TF" },
      { label: "Gabon", id: "GA" },
      { label: "Gambia", id: "GM" },
      { label: "Georgia", id: "GE" },
      { label: "Germany", id: "DE" },
      { label: "Ghana", id: "GH" },
      { label: "Gibraltar", id: "GI" },
      { label: "Greece", id: "GR" },
      { label: "Greenland", id: "GL" },
      { label: "Grenada", id: "GD" },
      { label: "Guadeloupe", id: "GP" },
      { label: "Guam", id: "GU" },
      { label: "Guatemala", id: "GT" },
      { label: "Guernsey", id: "GG" },
      { label: "Guinea", id: "GN" },
      { label: "Guinea-Bissau", id: "GW" },
      { label: "Guyana", id: "GY" },
      { label: "Haiti", id: "HT" },
      { label: "Heard Island and Mcdonald Islands", id: "HM" },
      { label: "Holy See (Vatican City State)", id: "VA" },
      { label: "Honduras", id: "HN" },
      { label: "Hong Kong", id: "HK" },
      { label: "Hungary", id: "HU" },
      { label: "Iceland", id: "IS" },
      { label: "India", id: "IN" },
      { label: "Indonesia", id: "ID" },
      { label: "Iran, Islamic Republic Of", id: "IR" },
      { label: "Iraq", id: "IQ" },
      { label: "Ireland", id: "IE" },
      { label: "Isle of Man", id: "IM" },
      { label: "Israel", id: "IL" },
      { label: "Italy", id: "IT" },
      { label: "Jamaica", id: "JM" },
      { label: "Japan", id: "JP" },
      { label: "Jersey", id: "JE" },
      { label: "Jordan", id: "JO" },
      { label: "Kazakhstan", id: "KZ" },
      { label: "Kenya", id: "KE" },
      { label: "Kiribati", id: "KI" },
      { label: "Korea, Democratic People'S Republic of", id: "KP" },
      { label: "Korea, Republic of", id: "KR" },
      { label: "Kuwait", id: "KW" },
      { label: "Kyrgyzstan", id: "KG" },
      { label: "Lao People'S Democratic Republic", id: "LA" },
      { label: "Latvia", id: "LV" },
      { label: "Lebanon", id: "LB" },
      { label: "Lesotho", id: "LS" },
      { label: "Liberia", id: "LR" },
      { label: "Libyan Arab Jamahiriya", id: "LY" },
      { label: "Liechtenstein", id: "LI" },
      { label: "Lithuania", id: "LT" },
      { label: "Luxembourg", id: "LU" },
      { label: "Macao", id: "MO" },
      { label: "Macedonia, The Former Yugoslav Republic of", id: "MK" },
      { label: "Madagascar", id: "MG" },
      { label: "Malawi", id: "MW" },
      { label: "Malaysia", id: "MY" },
      { label: "Maldives", id: "MV" },
      { label: "Mali", id: "ML" },
      { label: "Malta", id: "MT" },
      { label: "Marshall Islands", id: "MH" },
      { label: "Martinique", id: "MQ" },
      { label: "Mauritania", id: "MR" },
      { label: "Mauritius", id: "MU" },
      { label: "Mayotte", id: "YT" },
      { label: "Mexico", id: "MX" },
      { label: "Micronesia, Federated States of", id: "FM" },
      { label: "Moldova, Republic of", id: "MD" },
      { label: "Monaco", id: "MC" },
      { label: "Mongolia", id: "MN" },
      { label: "Montserrat", id: "MS" },
      { label: "Morocco", id: "MA" },
      { label: "Mozambique", id: "MZ" },
      { label: "Myanmar", id: "MM" },
      { label: "Namibia", id: "NA" },
      { label: "Nauru", id: "NR" },
      { label: "Nepal", id: "NP" },
      { label: "Netherlands", id: "NL" },
      { label: "Netherlands Antilles", id: "AN" },
      { label: "New Caledonia", id: "NC" },
      { label: "New Zealand", id: "NZ" },
      { label: "Nicaragua", id: "NI" },
      { label: "Niger", id: "NE" },
      { label: "Nigeria", id: "NG" },
      { label: "Niue", id: "NU" },
      { label: "Norfolk Island", id: "NF" },
      { label: "Northern Mariana Islands", id: "MP" },
      { label: "Norway", id: "NO" },
      { label: "Oman", id: "OM" },
      { label: "Pakistan", id: "PK" },
      { label: "Palau", id: "PW" },
      { label: "Palestinian Territory, Occupied", id: "PS" },
      { label: "Panama", id: "PA" },
      { label: "Papua New Guinea", id: "PG" },
      { label: "Paraguay", id: "PY" },
      { label: "Peru", id: "PE" },
      { label: "Philippines", id: "PH" },
      { label: "Pitcairn", id: "PN" },
      { label: "Poland", id: "PL" },
      { label: "Portugal", id: "PT" },
      { label: "Puerto Rico", id: "PR" },
      { label: "Qatar", id: "QA" },
      { label: "Reunion", id: "RE" },
      { label: "Romania", id: "RO" },
      { label: "Russian Federation", id: "RU" },
      { label: "Rwanda", id: "RW" },
      { label: "Saint Helena", id: "SH" },
      { label: "Saint Kitts and Nevis", id: "KN" },
      { label: "Saint Lucia", id: "LC" },
      { label: "Saint Pierre and Miquelon", id: "PM" },
      { label: "Saint Vincent and the Grenadines", id: "VC" },
      { label: "Samoa", id: "WS" },
      { label: "San Marino", id: "SM" },
      { label: "Sao Tome and Principe", id: "ST" },
      { label: "Saudi Arabia", id: "SA" },
      { label: "Senegal", id: "SN" },
      { label: "Serbia and Montenegro", id: "CS" },
      { label: "Seychelles", id: "SC" },
      { label: "Sierra Leone", id: "SL" },
      { label: "Singapore", id: "SG" },
      { label: "Slovakia", id: "SK" },
      { label: "Slovenia", id: "SI" },
      { label: "Solomon Islands", id: "SB" },
      { label: "Somalia", id: "SO" },
      { label: "South Africa", id: "ZA" },
      { label: "South Georgia and the South Sandwich Islands", id: "GS" },
      { label: "Spain", id: "ES" },
      { label: "Sri Lanka", id: "LK" },
      { label: "Sudan", id: "SD" },
      { label: "Suriname", id: "SR" },
      { label: "Svalbard and Jan Mayen", id: "SJ" },
      { label: "Swaziland", id: "SZ" },
      { label: "Sweden", id: "SE" },
      { label: "Switzerland", id: "CH" },
      { label: "Syrian Arab Republic", id: "SY" },
      { label: "Taiwan, Province of China", id: "TW" },
      { label: "Tajikistan", id: "TJ" },
      { label: "Tanzania, United Republic of", id: "TZ" },
      { label: "Thailand", id: "TH" },
      { label: "Timor-Leste", id: "TL" },
      { label: "Togo", id: "TG" },
      { label: "Tokelau", id: "TK" },
      { label: "Tonga", id: "TO" },
      { label: "Trinidad and Tobago", id: "TT" },
      { label: "Tunisia", id: "TN" },
      { label: "Turkey", id: "TR" },
      { label: "Turkmenistan", id: "TM" },
      { label: "Turks and Caicos Islands", id: "TC" },
      { label: "Tuvalu", id: "TV" },
      { label: "Uganda", id: "UG" },
      { label: "Ukraine", id: "UA" },
      { label: "United Arab Emirates", id: "AE" },
      { label: "United Kingdom", id: "GB" },
      { label: "United States", id: "US" },
      { label: "United States Minor Outlying Islands", id: "UM" },
      { label: "Uruguay", id: "UY" },
      { label: "Uzbekistan", id: "UZ" },
      { label: "Vanuatu", id: "VU" },
      { label: "Venezuela", id: "VE" },
      { label: "Viet Nam", id: "VN" },
      { label: "Virgin Islands, British", id: "VG" },
      { label: "Virgin Islands, U.S.", id: "VI" },
      { label: "Wallis and Futuna", id: "WF" },
      { label: "Western Sahara", id: "EH" },
      { label: "Yemen", id: "YE" },
      { label: "Zambia", id: "ZM" },
      { label: "Zimbabwe", id: "ZW" },
    ],
  },
];

var sampleConditions = [
  {
    field: {
      label: "Country",
      value: "country",
    },
    operator: {
      label: "any of",
      value: "in",
    },
    value: {
      label: "(France, Italy, Spain)",
      value: "FR,IT,ES",
    },
  },
  {
    field: {
      label: "Firstname",
      value: "firstname",
    },
    operator: {
      label: "starts with",
      value: "sw",
    },
    value: {
      label: '"Jo"',
      value: "Jo",
    },
  },
  {
    field: {
      label: "Age",
      value: "age",
    },
    operator: {
      label: ">",
      value: "gt",
    },
    value: {
      label: "21",
      value: "21",
    },
  },
  {
    field: {
      label: "Lastname",
      value: "lastname",
    },
    operator: {
      label: "contains",
      value: "ct",
    },
    value: {
      label: '"T"',
      value: "T",
    },
  },
];

var condIdx = 0;
var cl = sampleConditions.length - 2;

function addNewCondition() {
  condIdx = condIdx > cl ? 0 : condIdx + 1;
  filterDef = sampleConditions[condIdx];
  $("#evol").structFilter("addCondition", filterDef);
}

$(document).ready(function () {
  var v,
    valueFormat = "json";

  function updateValue(format) {
    switch (format) {
      case "json":
        v = JSON.stringify($("#evol").structFilter("val"), null, 2);
        break;
      case "text":
        v = $("#evol").structFilter("valText");
        break;
      case "url":
        v = $("#evol").structFilter("valUrl");
    }
    $("#myFilter").val(v);
  }

  // *****   setup theme links   *****
  $(".css").click(function () {
    var theme = this.innerHTML.toLowerCase().replace(" ", "-"),
      url =
        "https://ajax.googleapis.com/ajax/libs/jqueryui/" +
        version +
        "/themes/" +
        theme +
        "/jquery-ui.css";
    $("#jquiCSS").attr("href", url);
    $(".css").removeClass("sel");
    $(this).addClass("sel");
  });

  // *****   setup structured filter widget   *****
  $("#evol")
    .structFilter({ fields: contacts })
    .on("submit.search change.search", function (evt) {
      updateValue(valueFormat);
    });

  // *****   setup values   *****
  $("#linksValues > a").on("click", function () {
    var $this = $(this),
      id = $this.data("id");
    $this.addClass("sel").siblings().removeClass("sel");
    valueFormat = id;
    updateValue(id);
  });

  // *****   setup api tests links   *****
  $("#addCondition").click(addNewCondition);

  $("#delFilter").click(function () {
    $("#evol").structFilter("removeCondition", 0);
  });

  $("#clear").click(function () {
    $("#evol").structFilter("clear");
  });

  $("#length").click(function () {
    var v = $("#evol").structFilter("length"),
      msg;
    if (v === 0) {
      msg = "No conditions specified.";
    } else if (v === 1) {
      msg = "1 condition in filter.";
    } else {
      msg = v + " conditions in filter.";
    }
    alert(msg);
  });

  addNewCondition();

  // *****   Prevent links from scrolling   *****
  $('.demo-links > a[href="#"]').attr("href", "javascript:void(0)");
});
