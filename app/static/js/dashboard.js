document.addEventListener("DOMContentLoaded", () => {
    // --- Configuração Global de Fontes do Chart.js ---
    // Garante que os gráficos usem a mesma fonte do site (Inter)
    Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
    Chart.defaults.color = '#64748b'; // Cor cinza suave para os textos dos eixos

    // --- 1. Animação dos Números (Counter) ---
    document.querySelectorAll(".stat-value").forEach(el => {
        const finalValue = parseInt(el.getAttribute("data-value")) || 0;
        const duration = 1500; // 1.5 segundos para um efeito mais elegante
        const startTime = performance.now();

        function animate(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Easing: Começa rápido e desacelera suavemente no final
            const ease = 1 - Math.pow(1 - progress, 4);
            
            const currentValue = Math.floor(ease * finalValue);
            el.textContent = currentValue.toLocaleString("pt-BR");

            if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });

    // --- 2. Gráfico de Atividade Diária (Linha) - TEMA: GOLD ---
    if (typeof dailyData !== "undefined" && dailyData.labels.length > 0) {
        const ctxDaily = document.getElementById("dailyActivityChart").getContext("2d");
        
        // Cria um degradê vertical dourado suave para o preenchimento
        const gradient = ctxDaily.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(217, 119, 6, 0.25)'); // Cor Accent (Dourado) com transparência
        gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');    // Transparente no final

        new Chart(ctxDaily, {
            type: "line",
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: "Documentos",
                    data: dailyData.data,
                    backgroundColor: gradient,
                    borderColor: '#d97706', // Cor da linha (Dourado Sólido)
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff', // Ponto branco
                    pointBorderColor: '#d97706',     // Borda do ponto dourada
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 // Curva suave (Bézier)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a', // Fundo escuro (Navy)
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false, // Remove o quadradinho de cor
                        callbacks: {
                            label: context => `${context.parsed.y} documentos`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5],
                            color: '#f1f5f9' // Linhas de grade horizontais bem sutis
                        },
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        grid: { display: false } // Remove linhas verticais para limpar o visual
                    }
                }
            }
        });
    }

    // --- 3. Gráfico: Documentos por Empresa (Barra) - TEMA: NAVY ---
    if (typeof companyData !== "undefined" && companyData.length > 0) {
        const labels = companyData.map(item => {
            let name = item.company_name;
            // Corta nomes muito grandes para não quebrar o layout
            return name.length > 20 ? name.substring(0, 18) + "..." : name;
        });
        const data = companyData.map(item => item.count);

        const ctxCompany = document.getElementById("companyChart").getContext("2d");
        new Chart(ctxCompany, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Total Gerado",
                    data: data,
                    backgroundColor: '#1e293b', // Cor Navy Sólida (Sóbria e Profissional)
                    borderRadius: 4,            // Cantos arredondados no topo da barra
                    barPercentage: 0.6          // Barras mais finas e elegantes
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5],
                            color: '#f1f5f9'
                        },
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
});