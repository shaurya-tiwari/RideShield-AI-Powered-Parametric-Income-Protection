const fs = require("fs");

const hiFile = "src/locales/hi/common.json";
const enFile = "src/locales/en/common.json";

let hi = JSON.parse(fs.readFileSync(hiFile, "utf8"));
let en = JSON.parse(fs.readFileSync(enFile, "utf8"));

// English
en.auth = {
  ...en.auth,
  eyebrow: "Access",
  title: "Sign in to RideShield",
  subtitle: "Worker and admin sessions are separate for clean protection flows.",
  signing_in: "Signing in...",
  worker: {
    phone_label: "Registered phone number",
    password_label: "Password",
    password_placeholder: "Enter worker password",
    cta: "Continue as worker",
    no_account: "New here?",
    register_link: "Create a worker profile",
    info_hint: "After login, workers see their active protection, claim status, and payout history."
  },
  admin: {
    username_label: "Admin username",
    username_placeholder: "Enter admin username",
    password_label: "Admin password",
    password_placeholder: "Enter admin password",
    cta: "Continue as admin",
    info_hint: "Admins access the review queue, incident pressure, and demo controls."
  },
  sidebar: {
    label: "Why RideShield",
    headline: "Income protection that feels automatic, not bureaucratic.",
    p1: "Workers do not file claims manually. RideShield monitors zone-level disruptions and pays automatically when confidence is high.",
    p2: "Admins see the pressure points behind the engine: delayed reviews, fraud controls, and scheduler status.",
    p3: "The product explains outcomes clearly so claims never feel arbitrary."
  }
};

// Hindi
hi.auth = {
  ...hi.auth,
  eyebrow: "प्रवेश",
  title: "RideShield में साइन इन करें",
  subtitle: "कर्मचारी और एडमिन सत्र अलग हैं।",
  signing_in: "साइन इन हो रहा है...",
  worker: {
    phone_label: "पंजीकृत मोबाइल नंबर",
    password_label: "पासवर्ड",
    password_placeholder: "कर्मचारी पासवर्ड डालें",
    cta: "कर्मचारी के रूप में जारी रखें",
    no_account: "नए हैं?",
    register_link: "कर्मचारी प्रोफ़ाइल बनाएं",
    info_hint: "लॉगिन के बाद सक्रिय सुरक्षा, दावे की स्थिति और भुगतान इतिहास देखें।"
  },
  admin: {
    username_label: "एडमिन उपयोगकर्ता नाम",
    username_placeholder: "एडमिन उपयोगकर्ता नाम डालें",
    password_label: "एडमिन पासवर्ड",
    password_placeholder: "एडमिन पासवर्ड डालें",
    cta: "एडमिन के रूप में जारी रखें",
    info_hint: "एडमिन समीक्षा कतार, घटना दबाव और डेमो नियंत्रण तक पहुँचते हैं।"
  },
  sidebar: {
    label: "RideShield क्यों?",
    headline: "आय सुरक्षा जो स्वचालित लगती है, नौकरशाही नहीं।",
    p1: "कर्मचारी मैन्युअल दावे नहीं करते। RideShield क्षेत्र-स्तरीय व्यवधानों की निगरानी करता है और उच्च विश्वास होने पर स्वचालित रूप से भुगतान करता है।",
    p2: "एडमिन इंजन के पीछे के दबाव बिंदु देखते हैं: समीक्षाएं, धोखाधड़ी नियंत्रण और शेड्यूलर स्थिति।",
    p3: "उत्पाद परिणामों को स्पष्ट रूप से समझाने के लिए बना है।"
  }
};

// Fix the ??? in hi
if(hi.home.hero && hi.home.hero.there === "????") {
    hi.home.hero.there = "वहाँ";
}
if(hi.home.cta && hi.home.cta.register_now === "??? ??????? ????") {
    hi.home.cta.register_now = "अभी रजिस्टर करें";
}

fs.writeFileSync(hiFile, JSON.stringify(hi, null, 2), "utf8");
fs.writeFileSync(enFile, JSON.stringify(en, null, 2), "utf8");
console.log("JSON files updated.");
