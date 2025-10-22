document.addEventListener("DOMContentLoaded", () => {
    // --- Animação dos números com requestAnimationFrame ---
    document.querySelectorAll(".stat-value").forEach(el => {
        const finalValue = parseInt(el.getAttribute("data-value")) || 0;
        let start = 0;
        const duration = 1000; // 1 segundo
        const startTime = performance.now();

        function animate(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(progress * finalValue);
            el.textContent = currentValue.toLocaleString("pt-BR");

            if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });

    // --- Gráfico de Atividade Diária (Linha) ---
    if (typeof dailyData !== "undefined" && dailyData.labels.length > 0) {
        const ctxDaily = document.getElementById("dailyActivityChart").getContext("2d");
        
        const gradient = ctxDaily.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'hsla(210, 80%, 60%, 0.3)');
        gradient.addColorStop(1, 'hsla(210, 80%, 60%, 0)');

        new Chart(ctxDaily, {
            type: "line",
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: "Documentos Gerados",
                    data: dailyData.data,
                    backgroundColor: gradient,
                    borderColor: 'hsl(210, 80%, 60%)',
                    borderWidth: 2,
                    pointBackgroundColor: 'hsl(210, 80%, 60%)',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.parsed.y} documentos`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    // --- Gráfico: Documentos por Empresa (Barra) ---
    if (typeof companyData !== "undefined" && companyData.length > 0) {
        const labels = companyData.map(item => {
            let name = item.company_name;
            return name.length > 25 ? name.substring(0, 22) + "..." : name;
        });
        const data = companyData.map(item => item.count);

        const backgroundColors = labels.map((_, i) => `hsla(${i * 40}, 70%, 60%, 0.6)`);
        const borderColors = labels.map((_, i) => `hsl(${i * 40}, 70%, 40%)`);

        const ctxCompany = document.getElementById("companyChart").getContext("2d");
        new Chart(ctxCompany, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Documentos Gerados",
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.parsed.y} documentos`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
});