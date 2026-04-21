#!/bin/bash
# ==============================================
# CVI API — BATERIA COMPLETA DE TESTES
# ==============================================

API="http://localhost:3001"
PASS=0
FAIL=0
TOTAL=0

check() {
  TOTAL=$((TOTAL+1))
  local desc="$1"
  local expected_code="$2"
  local actual_code="$3"
  local response="$4"

  if [ "$actual_code" = "$expected_code" ]; then
    PASS=$((PASS+1))
    echo "  [PASS] $desc (HTTP $actual_code)"
  else
    FAIL=$((FAIL+1))
    echo "  [FAIL] $desc (esperado $expected_code, recebeu $actual_code)"
    echo "         Response: $response"
  fi
}

echo "============================================"
echo "  CVI API — BATERIA DE TESTES"
echo "============================================"
echo ""

# --- AUTH ---
echo "--- 1. AUTENTICAÇÃO ---"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{}')
CODE=$(echo "$R" | tail -1)
check "Login sem campos" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"nao@existe.com","password":"errada"}')
CODE=$(echo "$R" | tail -1)
check "Login credenciais inválidas" "401" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@cviam.com.br","password":"admin123"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -1)
check "Login válido" "200" "$CODE"

TOKEN=$(echo "$BODY" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch{console.log('')}})")

R=$(curl -s -w "\n%{http_code}" "$API/api/auth/me" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "GET /me autenticado" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/auth/me")
CODE=$(echo "$R" | tail -1)
check "GET /me sem token" "401" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/auth/me" -H "Authorization: Bearer tokenfalso")
CODE=$(echo "$R" | tail -1)
check "GET /me token falso" "401" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/auth/logout")
CODE=$(echo "$R" | tail -1)
check "POST /logout" "200" "$CODE"

echo ""

# --- EMPLOYEES ---
echo "--- 2. FUNCIONÁRIOS (CRUD) ---"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Maria Silva","email":"maria@cviam.com.br","password":"senha123","employmentType":"clt","department":"Fisioterapia","position":"Fisioterapeuta","requiresPunch":true}')
CODE=$(echo "$R" | tail -1)
check "Cadastrar CLT" "201" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Joao PJ","email":"joao@cviam.com.br","password":"senha123","employmentType":"pj","requiresPunch":false}')
CODE=$(echo "$R" | tail -1)
check "Cadastrar PJ" "201" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Dup","email":"maria@cviam.com.br","password":"senha123"}')
CODE=$(echo "$R" | tail -1)
check "Email duplicado (fix BUG-001)" "409" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Sem Email"}')
CODE=$(echo "$R" | tail -1)
check "Campos faltando" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Bad","email":"naoeumemail","password":"senha123"}')
CODE=$(echo "$R" | tail -1)
check "Email formato inválido" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Short","email":"short@cvi.com","password":"12"}')
CODE=$(echo "$R" | tail -1)
check "Senha muito curta" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Bad Time","email":"bad@cvi.com","password":"senha123","workStartTime":"99:99"}')
CODE=$(echo "$R" | tail -1)
check "Horário inválido" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/employees" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "Listar funcionários" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X PUT "$API/api/employees/2" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"position":"Fisioterapeuta Senior"}')
CODE=$(echo "$R" | tail -1)
check "Atualizar funcionário" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X PUT "$API/api/employees/abc" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"test"}')
CODE=$(echo "$R" | tail -1)
check "Update com ID inválido" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X DELETE "$API/api/employees/3" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "Desativar funcionário" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X DELETE "$API/api/employees/9999" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "Desativar inexistente" "404" "$CODE"

echo ""

# --- Login Maria para testes de ponto ---
R=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"maria@cviam.com.br","password":"senha123"}')
MARIA=$(echo "$R" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).token)}catch{console.log('')}})")

echo "--- 3. REGISTRO DE PONTO ---"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"entrada","latitude":"-3.0822","longitude":"-59.9742"}')
CODE=$(echo "$R" | tail -1)
check "Ponto entrada DENTRO perímetro" "201" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"entrada","latitude":"-3.0822","longitude":"-59.9742"}')
CODE=$(echo "$R" | tail -1)
check "Anti-duplo: entrada repetida <60s" "409" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"saida_almoco","latitude":"-3.1000","longitude":"-59.9900"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -1)
HAS_FORA=$(echo "$BODY" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).record.status)}catch{console.log('error')}})")
check "Ponto FORA perímetro (detecta)" "201" "$CODE"
TOTAL=$((TOTAL+1))
if [ "$HAS_FORA" = "fora_perimetro" ]; then PASS=$((PASS+1)); echo "  [PASS] Status = fora_perimetro"; else FAIL=$((FAIL+1)); echo "  [FAIL] Status deveria ser fora_perimetro, got $HAS_FORA"; fi

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"volta_almoco"}')
CODE=$(echo "$R" | tail -1)
check "Ponto sem GPS (aceita)" "201" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"saida","latitude":"NaN","longitude":"abc"}')
CODE=$(echo "$R" | tail -1)
check "Coordenadas GPS inválidas (NaN)" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"saida","latitude":"999","longitude":"-59"}')
CODE=$(echo "$R" | tail -1)
check "Latitude fora do range (999)" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"type":"invalido"}')
CODE=$(echo "$R" | tail -1)
check "Tipo de ponto inválido" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/ponto/registrar" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"type":"entrada"}')
CODE=$(echo "$R" | tail -1)
check "Admin PJ (não requer ponto)" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/hoje" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "GET /ponto/hoje" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/historico?dias=7" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "GET /ponto/historico" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/todos?dias=7" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "GET /ponto/todos (admin)" "200" "$CODE"

echo ""

# --- ESPELHO ---
echo "--- 4. ESPELHO DE PONTO ---"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/espelho?mes=2026-04" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Espelho próprio" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/espelho?mes=2026-04&userId=2" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "Admin vê espelho de outro" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/espelho?mes=2026-04&userId=1" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Funcionário vê espelho de admin" "403" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/espelho?mes=invalido" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Formato de mês inválido" "400" "$CODE"

echo ""

# --- AJUSTES ---
echo "--- 5. AJUSTES DE PONTO ---"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"requestedType":"saida","requestedTimestamp":"2026-04-21T10:00:00Z","reason":"Esqueci de bater o ponto de saida"}')
CODE=$(echo "$R" | tail -1)
check "Solicitar ajuste" "201" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{}')
CODE=$(echo "$R" | tail -1)
check "Ajuste sem campos" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"requestedType":"entrada","requestedTimestamp":"invalido","reason":"teste"}')
CODE=$(echo "$R" | tail -1)
check "Ajuste com data inválida" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"requestedType":"entrada","requestedTimestamp":"2030-01-01T08:00:00","reason":"teste futuro"}')
CODE=$(echo "$R" | tail -1)
check "Ajuste para data futura" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"requestedType":"entrada","requestedTimestamp":"2026-04-21T08:00:00","reason":"ab"}')
CODE=$(echo "$R" | tail -1)
check "Ajuste com motivo curto (<5 chars)" "400" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/adjustments/mine" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Meus ajustes" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/adjustments/pending" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$R" | tail -1)
check "Pendentes (admin)" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X PUT "$API/api/adjustments/1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"aprovado","reviewNotes":"Confirmado"}')
CODE=$(echo "$R" | tail -1)
check "Aprovar ajuste" "200" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X PUT "$API/api/adjustments/1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"aprovado"}')
CODE=$(echo "$R" | tail -1)
check "Dupla aprovação (anti race condition)" "409" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X PUT "$API/api/adjustments/1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"invalido"}')
CODE=$(echo "$R" | tail -1)
check "Status de review inválido" "400" "$CODE"

echo ""

# --- SEGURANÇA ---
echo "--- 6. SEGURANÇA E AUTORIZAÇÃO ---"

R=$(curl -s -w "\n%{http_code}" "$API/api/employees" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Funcionário acessa admin route" "403" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X POST "$API/api/employees" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"name":"Hack","email":"h@c.com","password":"123456"}')
CODE=$(echo "$R" | tail -1)
check "Funcionário cadastra outro" "403" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/todos" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Funcionário acessa todos os pontos" "403" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/adjustments/pending" -H "Authorization: Bearer $MARIA")
CODE=$(echo "$R" | tail -1)
check "Funcionário acessa pendentes" "403" "$CODE"

R=$(curl -s -w "\n%{http_code}" -X PUT "$API/api/adjustments/1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $MARIA" -d '{"status":"aprovado"}')
CODE=$(echo "$R" | tail -1)
check "Funcionário aprova ajuste" "403" "$CODE"

R=$(curl -s -w "\n%{http_code}" "$API/api/ponto/hoje")
CODE=$(echo "$R" | tail -1)
check "Rota protegida sem token" "401" "$CODE"

echo ""
echo "============================================"
echo "  RESULTADO FINAL"
echo "============================================"
echo "  Total:  $TOTAL"
echo "  Passou: $PASS"
echo "  Falhou: $FAIL"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then exit 1; fi
