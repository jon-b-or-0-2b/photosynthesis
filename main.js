import plantData from './plantData.js';

document.addEventListener('DOMContentLoaded', () => {
  const input        = document.getElementById('plant-input');
  const datalist     = document.getElementById('plant-list');
  const schedule     = document.getElementById('schedule');
  const plantTitle   = document.getElementById('plant-title');
  const waterInfo    = document.getElementById('water-info');
  const mistInfo     = document.getElementById('mist-info');
  const repotInfo    = document.getElementById('repot-info');
  const tempInfo     = document.getElementById('temp-info');
  const soilInfo     = document.getElementById('soil-info');
  const toxInfo      = document.getElementById('tox-info');
  const downloadPDF  = document.getElementById('download-pdf');
  const toggle       = document.getElementById('toggle-nontoxic');
  const clearBtn     = document.getElementById('clear-input');
  const copyBtn      = document.getElementById('copy-info');

  let filteredList = Object.keys(plantData);

  const renderList = () => {
    const onlyNonToxic = toggle.checked;
    datalist.innerHTML = '';

    filteredList
      .filter(name => !onlyNonToxic || plantData[name].toxicity.toLowerCase() === 'non-toxic')
      .sort((a, b) => a.localeCompare(b))
      .forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.append(option);
      });
  };

  renderList();
  toggle.addEventListener('change', renderList);

  input.addEventListener('change', () => {
    const plantName = input.value;
    const data = plantData[plantName];
    if (!data) {
      schedule.style.display = 'none';
      return;
    }

    plantTitle.textContent = plantName;
    waterInfo.textContent  = `Water every ${data.wateringDays} days.`;
    if (!data.mistingDays) {mistInfo.textContent = '';} else if (data.mistingDays === ": No Misting") {mistInfo.textContent = 'No misting needed.';} 
    else {mistInfo.textContent = `Mist every ${data.mistingDays} days.`;}
    if (data.repotMonths === ": No Repot") { repotInfo.textContent = 'No repotting needed.';} 
    else {repotInfo.textContent = `Repot every ${data.repotMonths === null ? "0" : data.repotMonths} months.`;}
    tempInfo.textContent   = `Ideal temperature: ${data.temperature}`;
    soilInfo.textContent   = `Soil type: ${data.soilType}`;
    toxInfo.textContent    = `Toxicity: ${data.toxicity}`;
    schedule.style.display = 'block';
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    schedule.style.display = 'none';
  });

  copyBtn.addEventListener('click', () => {
    const info = [
      plantTitle.textContent,
      waterInfo.textContent,
      mistInfo.textContent,
      repotInfo.textContent,
      tempInfo.textContent,
      soilInfo.textContent,
      toxInfo.textContent
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(info)
      .then(() => alert('Plant care info copied!'))
      .catch(err => alert('Failed to copy: ' + err));
  });

  downloadPDF.addEventListener('click', () => {
    const plantName = input.value;
    if (!plantName || !plantData[plantName]) return alert('Please choose a valid plant.');
    const data = plantData[plantName];

    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter', lineHeight: 1.2 });
    let y = 40;

    doc.setFontSize(22).setTextColor('#2E7D32')
       .text(`${plantName} Care Schedule`, 40, y);
    y += 30;

    doc.setFontSize(14).setTextColor('#263238')
       .text(`• Water every ${data.wateringDays} days.`, 40, y);
    y += 20;

    if (data.mistingDays) {
      doc.text(`• Mist every ${data.mistingDays} days.`, 40, y);
      y += 20;
    }

    doc.text(`• Repot every ${data.repotMonths} months.`, 40, y); y += 20;
    doc.text(`• Temperature: ${data.temperature}`, 40, y); y += 20;
    doc.text(`• Soil Type: ${data.soilType}`, 40, y); y += 20;
    doc.text(`• Toxicity: ${data.toxicity}`, 40, y); y += 30;

    const tip = [
      'Tip:',
      '• Water: saturate soil until a little drains out the bottom, then wait the recommended interval.',
      '• Mist: spray leaves lightly to boost humidity; this does NOT replace watering.'
    ];
    doc.setDrawColor('#81C784').setFillColor('#E8F5E9')
       .roundedRect(40, y, 500, 60, 6, 6, 'FD');
    doc.setFontSize(12).setTextColor('#546E7A')
       .text(tip, 50, y + 15);

    doc.save(`${plantName.replace(/\s+/g, '_')}_schedule.pdf`);
  });
});
