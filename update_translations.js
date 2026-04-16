const fs = require('fs');

const enPath = './frontend/src/locales/en/common.json';
const hiPath = './frontend/src/locales/hi/common.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// Updates
enData.howItWorks.promise_text = "You should be on the road earning, not filling out insurance paperwork. We pay you automatically when bad conditions hit.";
hiData.howItWorks.promise_text = "आपको कमाई करने के लिए सड़क पर होना चाहिए, न कि बीमा कागजी कार्रवाई भरने के लिए। जब खराब स्थिति आती है तो हम आपको स्वचालित रूप से भुगतान करते हैं।";

enData.howItWorks.diff_text = "Guaranteed payouts, zero paperwork, no hidden clauses.";
hiData.howItWorks.diff_text = "गारंटीकृत भुगतान, कोई कागजी कार्रवाई नहीं, कोई छिपी हुई शर्तें नहीं।";

enData.howItWorks.workerFlow.step3_body = "When severe weather or network outages hit your zone, our system verifies it instantly and automatically files an approved claim on your behalf.";
hiData.howItWorks.workerFlow.step3_body = "जब आपके क्षेत्र में खराब मौसम या नेटवर्क आउटेज होता है, तो हमारा सिस्टम तुरंत इसे सत्यापित करता है और स्वचालित रूप से आपकी ओर से एक स्वीकृत दावा दायर करता है।";

enData.howItWorks.policyEngine.waiting_period = "24-Hour Wait Period";
hiData.howItWorks.policyEngine.waiting_period = "24-घंटे प्रतीक्षा अवधि";

enData.howItWorks.policyEngine.waiting_period_detail = "To keep coverage affordable for everyone, policies activate 24 hours after purchase.";
hiData.howItWorks.policyEngine.waiting_period_detail = "सभी के लिए कवरेज किफायती रखने के लिए, नीतियां खरीद के 24 घंटे बाद सक्रिय होती हैं।";

enData.howItWorks.policyEngine.trigger_aware_detail = "Covers heavy rain, extreme heat, severe traffic, and delivery app outages.";
hiData.howItWorks.policyEngine.trigger_aware_detail = "भारी बारिश, अत्यधिक गर्मी, गंभीर ट्रैफ़िक और डिलीवरी ऐप आउटेज को कवर करता है।";

enData.howItWorks.systemLayers.trigger_engine = "Live Disruption Tracking";
hiData.howItWorks.systemLayers.trigger_engine = "लाइव व्यवधान ट्रैकिंग";

enData.howItWorks.systemLayers.claim_processor = "Automatic Claim Filing";
hiData.howItWorks.systemLayers.claim_processor = "स्वचालित दावा फाइलिंग";

enData.howItWorks.systemLayers.decision_engine = "Instant Approval Logic";
hiData.howItWorks.systemLayers.decision_engine = "त्वरित स्वीकृति तर्क";

enData.howItWorks.systemLayers.payout_executor = "Direct Wallet Transfer";
hiData.howItWorks.systemLayers.payout_executor = "सीधा वॉलेट ट्रांसफर";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 4));

console.log("Translations successfully updated.");
