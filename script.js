    lucide.createIcons();

    /* Reloj */
    function updateClock() {
      const now = new Date();
      document.getElementById("clock").textContent = now.toLocaleTimeString("es-PE");
      document.getElementById("date").textContent = now.toLocaleDateString("es-PE", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
    }
    setInterval(updateClock, 1000);
    updateClock();

    /* Coordenadas */
    const LAT = -12.47;
    const LON = -75.87;

    /* CULTIVOS REGIONALES YAUYOS */
    const cropsList = [
      { name: "Papa", min: 8,  max: 18 },
      { name: "Maíz", min: 15, max: 25 },
      { name: "Haba", min: 10, max: 18 },
      { name: "Arveja", min: 12, max: 20 },
      { name: "Durazno", min: 14, max: 22 },
      { name: "Manzana serrana", min: 10, max: 20 },
      { name: "Palta Fuerte", min: 15, max: 26 },
      { name: "Cebolla", min: 10, max: 24 },
      { name: "Zanahoria", min: 8,  max: 22 },
      { name: "Lechuga", min: 12, max: 18 },
      { name: "Repollo", min: 10, max: 20 },
      { name: "Tarwi", min: 8,  max: 20 }
    ];

    /* Alertas según clima */
    function generateAlerts(temp, rain, wind, humidity) {
      const alerts = [];

      if (temp <= 5) alerts.push("Riesgo de helada: proteger cultivos sensibles.");
      if (rain > 5) alerts.push("Lluvia significativa: riesgo de hongos en cultivos.");
      if (wind > 25) alerts.push("Vientos fuertes: asegurar invernaderos y túneles.");
      if (humidity > 85) alerts.push("Humedad alta: riesgo de mildiu, roya y tizones.");

      if (alerts.length === 0) alerts.push("No hay alertas relevantes. Condiciones estables.");

      return alerts;
    }

    /* Cargar datos Open-Meteo */
    async function loadWeather() {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,pressure_msl,uv_index,visibility&timezone=auto`;

      const res = await fetch(url);
      const data = await res.json();

      const weather = data.current_weather;
      const hourly = data.hourly;

      const temp = weather.temperature;
      const wind = weather.windspeed;
      const humidity = hourly.relativehumidity_2m[0];
      const rain = hourly.precipitation[0];
      const uv = hourly.uv_index[0];
      const vis = (hourly.visibility[0] / 1000).toFixed(1);
      const pressure = hourly.pressure_msl[0];
      const conditionCode = weather.weathercode;

      const weatherCodes = {
        0: "Despejado",
        1: "Mayormente despejado",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Niebla",
        48: "Niebla escarchada",
        51: "Llovizna ligera",
        61: "Lluvia ligera",
        63: "Lluvia moderada",
        65: "Lluvia fuerte",
        95: "Tormenta"
      };

      // Actualizar estado
      document.getElementById("conditionText").textContent = weatherCodes[conditionCode];
      document.getElementById("uv").textContent = uv;
      document.getElementById("pressure").textContent = pressure;
      document.getElementById("visibility").textContent = vis;

      // Widgets
      const widgets = [
        { icon: "thermometer", label: "Temperatura", value: temp, unit: "°C", color: "bg-orange-500" },
        { icon: "droplets", label: "Humedad", value: humidity, unit: "%", color: "bg-blue-500" },
        { icon: "cloud-rain", label: "Precipitación", value: rain, unit: "mm", color: "bg-indigo-500" },
        { icon: "wind", label: "Viento", value: wind, unit: "km/h", color: "bg-cyan-500" }
      ];

      const widgetContainer = document.getElementById("climateWidgets");
      widgetContainer.innerHTML = "";

      widgets.forEach(w => {
        widgetContainer.innerHTML += `
          <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 rounded-lg ${w.color}">
                <i data-lucide="${w.icon}" class="text-white" width="20"></i>
              </div>
              <span class="text-sm font-medium text-gray-600">${w.label}</span>
            </div>
            <p class="text-2xl font-bold text-gray-800">${w.value}${w.unit}</p>
          </div>
        `;
      });

      /* Alertas */
      const alerts = generateAlerts(temp, rain, wind, humidity);
      const alertsContainer = document.getElementById("alertsContainer");
      alertsContainer.innerHTML = "";
      alerts.forEach(a => {
        alertsContainer.innerHTML += `
          <div class="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800">
            ${a}
          </div>`;
      });

      /* Evaluación de cultivos */
      const cropsContainer = document.getElementById("cropsContainer");
      cropsContainer.innerHTML = "";

      cropsList.forEach(crop => {
        const status = temp >= crop.min && temp <= crop.max
          ? `<span class="text-green-600 font-bold">Óptimo</span>`
          : `<span class="text-red-600 font-bold">Fuera de rango</span>`;

        cropsContainer.innerHTML += `
          <div class="p-5 border rounded-lg shadow bg-white">
            <h3 class="text-xl font-bold mb-2">${crop.name}</h3>
            <p>Rango óptimo: ${crop.min}°C a ${crop.max}°C</p>
            <p class="mt-2">Estado actual: ${status}</p>
          </div>
        `;
      });

      lucide.createIcons();
    }

    /* Ejecutar */
    loadWeather();
