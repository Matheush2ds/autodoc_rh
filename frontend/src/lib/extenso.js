/**
 * Valor por extenso em português — apenas para PRÉVIA na tela.
 *
 * O valor que entra no documento continua sendo calculado no backend
 * pelo num2words (app.py → formatar_salario_por_extenso). Esta função
 * existe só para o operador conferir enquanto digita.
 */

const UNI = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_ESP = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CEN = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function trio(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const parts = [];
  if (c) parts.push(CEN[c]);
  if (d === 1) parts.push(DEZ_ESP[u]);
  else {
    if (d) parts.push(DEZ[d]);
    if (u) parts.push(UNI[u]);
  }
  return parts.join(' e ');
}

function inteiroPorExtenso(n) {
  if (n === 0) return 'zero';

  const escalas = [
    { div: 1e9, sing: 'bilhão', plur: 'bilhões' },
    { div: 1e6, sing: 'milhão', plur: 'milhões' },
    { div: 1e3, sing: 'mil', plur: 'mil' },
    { div: 1, sing: '', plur: '' },
  ];

  const grupos = [];
  let resto = n;

  for (const { div, sing, plur } of escalas) {
    const q = Math.floor(resto / div);
    resto %= div;
    if (!q) continue;

    if (div === 1) grupos.push({ texto: trio(q), valor: q });
    else if (div === 1e3) grupos.push({ texto: q === 1 ? 'mil' : `${trio(q)} mil`, valor: q * div });
    else grupos.push({ texto: `${trio(q)} ${q === 1 ? sing : plur}`, valor: q * div });
  }

  if (grupos.length === 1) return grupos[0].texto;

  const ultimo = grupos[grupos.length - 1];
  const anteriores = grupos.slice(0, -1).map((g) => g.texto);

  // Em português, o último grupo entra com "e" quando é menor que cem
  // ou uma centena redonda; caso contrário, entra após vírgula.
  const usaE = ultimo.valor < 100 || (ultimo.valor < 1000 && ultimo.valor % 100 === 0);
  return usaE ? `${anteriores.join(', ')} e ${ultimo.texto}` : `${anteriores.join(', ')}, ${ultimo.texto}`;
}

/** Recebe "R$ 2.500,00" (ou 2500.5) e devolve "dois mil e quinhentos reais". */
export function salarioPorExtenso(valor) {
  if (valor === null || valor === undefined || valor === '') return '';

  const numero =
    typeof valor === 'number'
      ? valor
      : parseFloat(String(valor).replace(/[R$\s.]/g, '').replace(',', '.'));

  if (!Number.isFinite(numero) || numero < 0) return '';

  const reais = Math.floor(numero);
  const centavos = Math.round((numero - reais) * 100);

  if (reais === 0 && centavos === 0) return 'zero reais';

  const partes = [];
  if (reais > 0) {
    partes.push(`${inteiroPorExtenso(reais)} ${reais === 1 ? 'real' : 'reais'}`);
  }
  if (centavos > 0) {
    partes.push(`${inteiroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`);
  }

  return partes.join(' e ');
}
