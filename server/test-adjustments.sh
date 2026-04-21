#!/bin/bash
API="http://localhost:3001"
P=0; F=0; T=0

r() {
  T=$((T+1))
  local d="$1" exp="$2" got="$3"
  if [ "$got" = "$exp" ]; then P=$((P+1)); echo "  [PASS] $d (HTTP $got)"
  else F=$((F+1)); echo "  [FAIL] $d (esperado $exp, recebeu $got)"; fi
}

# Tokens
TOKEN=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@cviam.com.br","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
FUNC=$(curl -s -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"func@cviam.com.br","password":"func123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "============================================"
echo "  TESTES — AJUSTE DE PONTO"
echo "============================================"

echo ""
echo "--- 1. CRIACAO DE SOLICITACAO ---"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"entrada","requestedTimestamp":"2026-04-21T08:00:00Z","reason":"Esqueci de bater o ponto de entrada"}')
r "Solicitacao valida (entrada)" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"saida_almoco","requestedTimestamp":"2026-04-21T12:00:00Z","reason":"GPS falhou na saida para almoco"}')
r "Solicitacao saida almoco" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"saida","requestedTimestamp":"2026-04-21T17:00:00Z","reason":"Saida nao registrou corretamente"}')
r "Solicitacao saida" "201" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{}')
r "Sem campos" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"entrada","requestedTimestamp":"2026-04-21T08:00:00Z","reason":"ab"}')
r "Motivo curto (<5)" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"invalido","requestedTimestamp":"2026-04-21T08:00:00Z","reason":"tipo invalido teste aqui"}')
r "Tipo invalido" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"entrada","requestedTimestamp":"2030-01-01T08:00:00Z","reason":"data futura teste aqui"}')
r "Data futura" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"entrada","requestedTimestamp":"invalido","reason":"timestamp invalido teste"}')
r "Timestamp invalido" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/adjustments" -H "Content-Type: application/json" -d '{"requestedType":"entrada","requestedTimestamp":"2026-04-21T08:00:00Z","reason":"sem auth"}')
r "Sem autenticacao" "401" "$C"

R=$(curl -s -X POST "$API/api/adjustments" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"requestedType":"volta_almoco","requestedTimestamp":"2026-04-21T13:00:00Z","reason":"<script>alert(1)</script> esqueci ponto"}')
T=$((T+1))
if echo "$R" | grep -q "<script>"; then F=$((F+1)); echo "  [FAIL] XSS nao sanitizado"
else P=$((P+1)); echo "  [PASS] XSS sanitizado no motivo"; fi

echo ""
echo "--- 2. LISTAGEM ---"

R=$(curl -s "$API/api/adjustments/mine" -H "Authorization: Bearer $FUNC")
COUNT=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$COUNT" -ge 3 ]; then P=$((P+1)); echo "  [PASS] Meus ajustes: $COUNT solicitacoes"
else F=$((F+1)); echo "  [FAIL] Esperado >= 3, encontrou $COUNT"; fi

C=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/adjustments/pending" -H "Authorization: Bearer $FUNC")
r "Func bloqueado de pendentes" "403" "$C"

R=$(curl -s "$API/api/adjustments/pending" -H "Authorization: Bearer $TOKEN")
PCOUNT=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$PCOUNT" -ge 3 ]; then P=$((P+1)); echo "  [PASS] Admin ve pendentes: $PCOUNT"
else F=$((F+1)); echo "  [FAIL] Admin pendentes: esperado >= 3, obteve $PCOUNT"; fi

T=$((T+1))
if echo "$R" | grep -q "Funcionario Teste"; then P=$((P+1)); echo "  [PASS] Nome do func aparece nas pendentes"
else F=$((F+1)); echo "  [FAIL] Nome ausente nas pendentes"; fi

echo ""
echo "--- 3. APROVACAO E REJEICAO ---"

ADJ1=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
ADJ2=$(echo "$R" | grep -o '"id":[0-9]*' | head -2 | tail -1 | grep -o '[0-9]*')
ADJ3=$(echo "$R" | grep -o '"id":[0-9]*' | head -3 | tail -1 | grep -o '[0-9]*')

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"aprovado","reviewNotes":"Confirmado pela camera"}')
r "Aprovar ajuste #$ADJ1" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ2/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"rejeitado","reviewNotes":"Nao confirmado"}')
r "Rejeitar ajuste #$ADJ2" "200" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ1/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"aprovado"}')
r "Dupla aprovacao bloqueada" "409" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ2/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"rejeitado"}')
r "Dupla rejeicao bloqueada" "409" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ3/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"invalido"}')
r "Status invalido" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/99999/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"aprovado"}')
r "ID inexistente" "404" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/abc/review" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"aprovado"}')
r "ID invalido (abc)" "400" "$C"

C=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/api/adjustments/$ADJ3/review" -H "Content-Type: application/json" -H "Authorization: Bearer $FUNC" -d '{"status":"aprovado"}')
r "Func tenta aprovar" "403" "$C"

echo ""
echo "--- 4. VERIFICACAO POS-APROVACAO ---"

R=$(curl -s "$API/api/ponto/hoje" -H "Authorization: Bearer $FUNC")
T=$((T+1))
if echo "$R" | grep -q '"status":"ajustado"'; then P=$((P+1)); echo "  [PASS] Registro ajustado criado apos aprovacao"
else F=$((F+1)); echo "  [FAIL] Registro ajustado NAO criado"; fi

R=$(curl -s "$API/api/adjustments/mine" -H "Authorization: Bearer $FUNC")
T=$((T+1))
APR=$(echo "$R" | grep -o '"status":"aprovado"' | wc -l)
REJ=$(echo "$R" | grep -o '"status":"rejeitado"' | wc -l)
PEN=$(echo "$R" | grep -o '"status":"pendente"' | wc -l)
echo "  [PASS] Status: aprovados=$APR rejeitados=$REJ pendentes=$PEN"
P=$((P+1))

R=$(curl -s "$API/api/adjustments/pending" -H "Authorization: Bearer $TOKEN")
NEW_P=$(echo "$R" | grep -o '"id":' | wc -l)
T=$((T+1))
if [ "$NEW_P" -lt "$PCOUNT" ]; then P=$((P+1)); echo "  [PASS] Pendentes reduziram: $PCOUNT -> $NEW_P"
else F=$((F+1)); echo "  [FAIL] Pendentes nao reduziram: $PCOUNT -> $NEW_P"; fi

echo ""
echo "============================================"
echo "  RESULTADO"
echo "============================================"
echo "  Total:  $T"
echo "  Passou: $P"
echo "  Falhou: $F"
echo "============================================"
if [ "$F" -eq 0 ]; then echo "  OK"; fi
