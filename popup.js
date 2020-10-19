function addToTable(rows) {
  var table = document.getElementById("data");
  for ( var index in rows ) {
    var row = table.insertRow(-1);
    row.style = "white-space:nowrap";
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = '<b>'+index+'</b>';
    cell2.innerHTML = rows[index];
  }
}

function removeTags(str) {
      if ((str===null) || (str===''))
      return false;
      else
      str = str.toString();
      str = str.replace( /(<([^>]+)>)/ig, '');
      return str.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
   }

window.addEventListener('click',function(e){
  if(e.target.href!==undefined){
    chrome.tabs.create({url:e.target.href})
  }
})

document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    chrome.system.cpu.getInfo(function(cpu_info) {
      chrome.system.memory.getInfo(function(mem_info) {
        if (cpu_info.modelName) {
          var cpu_model = cpu_info.modelName;
        } else {
          var cpu_model = cpu_info.archName;
        }
        cpu_model = cpu_model.replace(/\([^\)]*\)/g, ""); // remove useless info
        cpu_model = cpu_model.replace(/(,.*)/g, ""); // remove comma and everything after
        cpu_model = cpu_model.replace('  ', ' '); // doublespace to single
        cpu_model = cpu_model.replace(/^ /g, ''); // remove space at start of string
        cpu_model = cpu_model.replace(/ $/g, ''); // remove space at end of string
        var cpu_count = cpu_info.numOfProcessors;
        var memory_gb = Math.ceil(mem_info.capacity/1024/1024/1024);
        var intel_generation = null;
        var cpu_level = 0;
        if (cpu_model.includes('Intel')) {
          var intel_generation = 'Unknown-';
          if (/[im][3-9]-[Y0-9]{4}/.test(cpu_model)) {
              intel_generation = cpu_model.match(/[im][3-9]-(.)/)[1];
              }
          if ((cpu_model.includes('N3') && cpu_count >= 4) || (cpu_model.includes('N4') && cpu_count >= 2)) {
            intel_generation = null;
            cpu_level = 1;
            }
          if ((/N[45]/.test(cpu_model) && cpu_count >= 4) || (/[im][3-9]-[17-9][Y0-9]{3}/.test(cpu_model))) {
            if (/N[45]/.test(cpu_model)) {
              intel_generation = null;
              }
            cpu_level = 2;
            }
          if (/[im][5-9]-[17-9][Y0-9]{3}/.test(cpu_model) && cpu_count >= 4) {
            cpu_level = 3;
            }
        } else if (cpu_model.includes('AMD')) {
          if (/3[0-9]{3}/.test(cpu_model) || cpu_model.includes('Athlon 300')) {
            cpu_level = 1;
            }
          if (cpu_model.includes('3300U')) {
            cpu_level = 2;
            }
          if (cpu_model.includes('3500U')) {
            cpu_level = 3;
            }
        } else if (cpu_model.includes('aarch64')) {
          if (cpu_count >= 4) {
            // Assume this is a Mediatek 8173 or equivalent
            cpu_level = 1;
          }
        }
        var mapped_items = {
          'CPU Model': cpu_model,
          'CPU Count (logical)': cpu_count,
          'Memory': memory_gb + 'gb', 
          };
        if (intel_generation != null) {
          if (intel_generation < 7  && intel_generation != 1) {
            gen_color = 'red';
          } else {
            gen_color = 'green';
          }
          mapped_items['Intel CPU Generation'] = intel_generation + 'th generation'
          mapped_items['Intel CPU Generation'] = mapped_items['Intel CPU Generation'].fontcolor(gen_color);
          }
        var meet_spec = 'Unsupported'.fontcolor('red');
        var recommended_view = 'spotlight only, no tiled'.fontcolor('red');
        var hd_recommended = 'Standard definition (360p)'.fontcolor('orange');
        var present_recommended = 'No'.fontcolor('orange');
        var recommended_tabs = '0'.fontcolor('red');
        if ((cpu_count >= 2) && (memory_gb >= 2)) {
          meet_spec = 'Minimal support'.fontcolor('orange');
          }
        if (cpu_level >= 1 && memory_gb >= 4) {
          meet_spec = 'Supported'.fontcolor('green');
          recommended_view = 'any including tiled'.fontcolor('green');
          recommended_tabs = '2'.fontcolor('orange');
          }
        if (cpu_level >= 2 && memory_gb >= 4) {
          meet_spec = 'Supported, present'.fontcolor('green');
          recommended_view = 'any including tiled'.fontcolor('green');
          recommended_tabs = '10'.fontcolor('green');
          present_recommended = 'Yes'.fontcolor('green');
          }
        if (cpu_level >= 3 && memory_gb >= 8) {
          meet_spec = 'Supported, present and HD video'.fontcolor('green');
          recommended_view = 'any including tiled'.fontcolor('green');
          recommended_tabs = '25'.fontcolor('green');
          present_recommended = 'Yes'.fontcolor('green');
          hd_recommended = 'High definition (720p)'.fontcolor('green');
          }
        mapped_items['Google Meet Support'] = meet_spec;
        mapped_items['Layout Recommended'] = recommended_view;
        mapped_items['Max other tabs/apps open'] = recommended_tabs;
        mapped_items['Presenting recommended'] = present_recommended;
        mapped_items['Recommended send/receive resolution'] = hd_recommended;

        addToTable(mapped_items);
        issue_url = 'https://docs.google.com/forms/d/e/1FAIpQLSdhCQXlL3D_BzSKp1U31i483Nb27VtCwm9L-Ta7YLKN5WsXKQ/viewform?usp=pp_url' +
                    '&entry.452973251=' + cpu_model +
                    '&entry.1798865770=' + cpu_count +
                    '&entry.817226060='  + memory_gb +
                    '&entry.2127009713=' + removeTags(mapped_items['Google Meet Support']) +
                    '&entry.27023696=' + removeTags(mapped_items['Layout Recommended']) +
                    '&entry.604132738=' + removeTags(mapped_items['Max other tabs/apps open']) +
                    '&entry.400342696=' + removeTags(mapped_items['Presenting recommended']) +
                    '&entry.1576852868=' + removeTags(mapped_items['Recommended send/receive resolution']) +
                    '&entry.1107671487=' + navigator.userAgent;
        document.getElementById("report_issue").href = issue_url;
        });
      });
    };
  };

