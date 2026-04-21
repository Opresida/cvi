#!/bin/bash
API="http://localhost:3001"
P=0; F=0; T=0

r() {
  T=$((T+1))
  local d="$1" exp="$2" got="$3"
  if [ "$got" = "$exp" ]; then P=$((P+1)); echo "  [PASS] $d"
  else F=$((F+1)); echo "  [FAIL] $d (esperado $exp, recebeu $got)"; fi
}

echo "================================================================"
echo "  CVI PONTO — TESTE COMPLETO DA API ($(date '+%Y-%m-%d %H:%M'))"
echo "================================================================"

# ========== 1. AUTH ==========
echo -e "\n━━━ 1. AUTENTICAÇÃO ━━━"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{}')
r "Login sem campos → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"nao@existe.com","password":"errada"}')
r "Login credenciais inválidas → 401" "401" "$C"

RESP=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@cviam.com.br","password":"admin123"}')
TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
C=$([ ${#TOKEN} -gt 50 ] && echo "200" || echo "FAIL")
r "Login admin válido → token" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/auth/me" -H "Authorization: Bearer $TOKEN")
r "GET /me autenticado → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/auth/me")
r "GET /me sem token → 401" "401" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/auth/me" -H "Authorization: Bearer tokenfalso")
r "GET /me token falso → 401" "401" "$C"

# Token replay test
OLD=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
curl -s -X POST "$API/api/auth/logout" -H "Authorization: Bearer $OLD" > /dev/null
C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/auth/me" -H "Authorization: Bearer $OLD")
r "Token replay após logout → 401" "401" "$C"

# Re-login
RESP=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@cviam.com.br","password":"admin123"}')
TOKEN=$(echo "$RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/logout")
r "POST /logout → 200" "200" "$C"

# ========== 2. EMPLOYEES ==========
echo -e "\n━━━ 2. FUNCIONÁRIOS (CRUD) ━━━"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Ana Oliveira","email":"ana@cviam.com.br","password":"senha123","employmentType":"clt","department":"Fisioterapia","position":"Fisioterapeuta","requiresPunch":true}')
r "Cadastrar CLT → 201" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Carlos PJ","email":"carlos@cviam.com.br","password":"senha123","employmentType":"pj","requiresPunch":false}')
r "Cadastrar PJ → 201" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Dup","email":"ana@cviam.com.br","password":"senha123"}')
r "Email duplicado → 409" "409" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"X"}')
r "Campos faltando → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Bad","email":"naoeumemail","password":"senha123"}')
r "Email inválido → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Short","email":"s@c.com","password":"12"}')
r "Senha curta → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Bad","email":"b@c.com","password":"senha123","workStartTime":"99:99"}')
r "Horário inválido → 400" "400" "$C"

R=$(curl -s "$API/api/employees" -H "Authorization: Bearer $TOKEN")
EMP_COUNT=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$EMP_COUNT" -ge 3 ]; then P=$((P+1)); echo "  [PASS] Listar funcionários ($EMP_COUNT encontrados)"
else F=$((F+1)); echo "  [FAIL] Listar: esperado >= 3, obteve $EMP_COUNT"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/employees/2" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"position":"Fisioterapeuta Senior","weeklyHours":36}')
r "Atualizar funcionário → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/employees/abc" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"x"}')
r "Update ID inválido → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/api/employees/3" -H "Authorization: Bearer $TOKEN")
r "Desativar funcionário → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/api/employees/99999" -H "Authorization: Bearer $TOKEN")
r "Desativar inexistente → 404" "404" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/employees/3" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"active":true}')
r "Reativar funcionário → 200" "200" "$C"

# ========== 3. PONTO ==========
echo -e "\n━━━ 3. REGISTRO DE PONTO ━━━"

# Login como Ana (CLT)
ANA_RESP=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"ana@cviam.com.br","password":"senha123"}')
ANA=$(echo "$ANA_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

R=$(curl -s -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"entrada","latitude":"-3.0822","longitude":"-59.9742"}')
C=$(echo "$R" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
T=$((T+1))
if [ "$C" = "valido" ]; then P=$((P+1)); echo "  [PASS] Entrada DENTRO perímetro → valido"
else F=$((F+1)); echo "  [FAIL] Entrada dentro: esperado valido, obteve $C"; fi

DIST=$(echo "$R" | grep -o '"distance":[0-9.]*' | cut -d':' -f2)
T=$((T+1))
if [ -n "$DIST" ]; then P=$((P+1)); echo "  [PASS] Distância calculada: ${DIST}m"
else F=$((F+1)); echo "  [FAIL] Distância não retornada"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"entrada","latitude":"-3.0822","longitude":"-59.9742"}')
r "Anti-duplo (<60s) → 409" "409" "$C"

R=$(curl -s -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"saida_almoco","latitude":"-3.1000","longitude":"-59.9900"}')
C=$(echo "$R" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
T=$((T+1))
if [ "$C" = "fora_perimetro" ]; then P=$((P+1)); echo "  [PASS] Fora do perímetro detectado"
else F=$((F+1)); echo "  [FAIL] Esperado fora_perimetro, obteve $C"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"volta_almoco"}')
r "Ponto sem GPS → 201" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"saida","latitude":"NaN","longitude":"abc"}')
r "GPS inválido (NaN) → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"saida","latitude":"999","longitude":"-59"}')
r "Latitude fora range → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"saida","latitude":"1; DROP TABLE","longitude":"-59.97"}')
r "SQLi na latitude → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"type":"invalido"}')
r "Tipo inválido → 400" "400" "$C"

R=$(curl -s "$API/api/ponto/hoje" -H "Authorization: Bearer $ANA")
TODAY=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$TODAY" -ge 3 ]; then P=$((P+1)); echo "  [PASS] GET /hoje: $TODAY registros"
else F=$((F+1)); echo "  [FAIL] GET /hoje: esperado >= 3, obteve $TODAY"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/historico?dias=7" -H "Authorization: Bearer $ANA")
r "GET /historico → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/todos?dias=7" -H "Authorization: Bearer $TOKEN")
r "GET /todos (admin) → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/todos" -H "Authorization: Bearer $ANA")
r "GET /todos (func bloqueado) → 403" "403" "$C"

# ========== 4. ESPELHO ==========
echo -e "\n━━━ 4. ESPELHO DE PONTO ━━━"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/espelho?mes=2026-04" -H "Authorization: Bearer $ANA")
r "Espelho próprio → 200" "200" "$C"

R=$(curl -s "$API/api/ponto/espelho?mes=2026-04" -H "Authorization: Bearer $ANA")
T=$((T+1))
if echo "$R" | grep -q '"totalPunches"'; then P=$((P+1)); echo "  [PASS] Espelho contém totalPunches"
else F=$((F+1)); echo "  [FAIL] Espelho sem totalPunches"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/espelho?mes=2026-04&userId=2" -H "Authorization: Bearer $TOKEN")
r "Admin vê espelho de outro → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/espelho?mes=2026-04&userId=1" -H "Authorization: Bearer $ANA")
r "Func vê espelho de admin → 403" "403" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/espelho?mes=invalido" -H "Authorization: Bearer $ANA")
r "Formato mês inválido → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/espelho?mes=2025-01" -H "Authorization: Bearer $ANA")
r "Mês sem dados → 200 (vazio)" "200" "$C"

# ========== 5. AJUSTES ==========
echo -e "\n━━━ 5. AJUSTES DE PONTO ━━━"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"requestedType":"entrada","requestedTimestamp":"2026-04-20T08:00:00Z","reason":"Esqueci de registrar entrada ontem"}')
r "Solicitar ajuste → 201" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"requestedType":"saida","requestedTimestamp":"2026-04-20T17:00:00Z","reason":"Saida tambem nao registrou ontem"}')
r "Segundo ajuste → 201" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" -d '{}')
r "Ajuste sem campos → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"requestedType":"entrada","requestedTimestamp":"2026-04-20T08:00:00Z","reason":"ab"}')
r "Motivo curto → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"requestedType":"invalido","requestedTimestamp":"2026-04-20T08:00:00Z","reason":"tipo invalido aqui"}')
r "Tipo inválido → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"requestedType":"entrada","requestedTimestamp":"2030-01-01T08:00:00Z","reason":"data futura aqui teste"}')
r "Data futura → 400" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"requestedType":"entrada","requestedTimestamp":"invalido","reason":"timestamp invalido"}')
r "Timestamp inválido → 400" "400" "$C"

R=$(curl -s "$API/api/adjustments/mine" -H "Authorization: Bearer $ANA")
MINE_COUNT=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$MINE_COUNT" -ge 2 ]; then P=$((P+1)); echo "  [PASS] Meus ajustes: $MINE_COUNT"
else F=$((F+1)); echo "  [FAIL] Meus ajustes: esperado >= 2, obteve $MINE_COUNT"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/adjustments/pending" -H "Authorization: Bearer $ANA")
r "Func bloqueado de pendentes → 403" "403" "$C"

R=$(curl -s "$API/api/adjustments/pending" -H "Authorization: Bearer $TOKEN")
PEND=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$PEND" -ge 2 ]; then P=$((P+1)); echo "  [PASS] Admin vê pendentes: $PEND"
else F=$((F+1)); echo "  [FAIL] Pendentes: esperado >= 2, obteve $PEND"; fi

ADJ1=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
ADJ2=$(echo "$R" | grep -o '"id":[0-9]*' | head -2 | tail -1 | grep -o '[0-9]*')

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"aprovado","reviewNotes":"Confirmado"}')
r "Aprovar ajuste #$ADJ1 → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ2/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"rejeitado","reviewNotes":"Nao confirmado"}')
r "Rejeitar ajuste #$ADJ2 → 200" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"aprovado"}')
r "Dupla aprovação → 409" "409" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/99999/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"aprovado"}')
r "Ajuste inexistente → 404" "404" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"status":"aprovado"}')
r "Func tenta aprovar → 403" "403" "$C"

# Verificar registro ajustado criado
R=$(curl -s "$API/api/ponto/espelho?mes=2026-04" -H "Authorization: Bearer $ANA")
T=$((T+1))
if echo "$R" | grep -q '"ajustado"'; then P=$((P+1)); echo "  [PASS] Registro ajustado criado pós-aprovação"
else F=$((F+1)); echo "  [FAIL] Registro ajustado NÃO encontrado no espelho"; fi

# ========== 6. SEGURANÇA ==========
echo -e "\n━━━ 6. SEGURANÇA E AUTORIZAÇÃO ━━━"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/employees" -H "Authorization: Bearer $ANA")
r "Func → employees → 403" "403" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $ANA" \
  -d '{"name":"Hack","email":"h@c.com","password":"123456"}')
r "Func cria funcionário → 403" "403" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/api/employees/1" -H "Authorization: Bearer $ANA")
r "Func deleta admin → 403" "403" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/ponto/hoje")
r "Rota sem token → 401" "401" "$C"

# XSS
R=$(curl -s -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"<script>alert(1)</script>","email":"xss2@c.com","password":"senha123"}')
T=$((T+1))
if echo "$R" | grep -q "<script>"; then F=$((F+1)); echo "  [FAIL] XSS não sanitizado no name"
else P=$((P+1)); echo "  [PASS] XSS sanitizado no name"; fi

# SQLi
C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"admin' OR 1=1--\",\"password\":\"x\"}")
r "SQLi no login → 401 (não bypassou)" "401" "$C"

echo ""
echo "================================================================"
echo "  RELATÓRIO FINAL — API"
echo "================================================================"
echo "  Total de testes:  $T"
echo "  Aprovados:        $P"
echo "  Reprovados:       $F"
echo "  Taxa de sucesso:  $(( P * 100 / T ))%"
echo "================================================================"
if [ "$F" -eq 0 ]; then
  echo "  ✅ TODOS OS TESTES PASSARAM"
else
  echo "  ⚠️  $F TESTE(S) FALHARAM"
fi
echo "================================================================"
