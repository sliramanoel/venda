#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Site de suplemento natural NeuroVita com página inicial, quem somos, FAQ, página de vendas com calculadora de frete via ViaCEP e botão de pagamento PIX, painel admin para gerenciar configurações, imagens e pedidos.

backend:
  - task: "GET /api/settings - Retornar configurações do site"
    implemented: true
    working: true
    file: "routers/settings.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado e testado manualmente via curl"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Retorna todos os campos obrigatórios: name, tagline, description, phone, email, instagram, paymentLink. Endpoint funcionando perfeitamente."

  - task: "PUT /api/settings - Atualizar configurações do site"
    implemented: true
    working: true
    file: "routers/settings.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado com atualização parcial de campos"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Atualização parcial funcionando corretamente. Testado com name='NeuroVita Teste' e tagline='Memória Testada', ambos atualizados com sucesso."

  - task: "GET /api/images - Retornar URLs das imagens"
    implemented: true
    working: true
    file: "routers/images.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado e testado manualmente via curl"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Retorna corretamente URLs: main, secondary, tertiary. Todas as imagens estão sendo servidas adequadamente."

  - task: "PUT /api/images - Atualizar URLs das imagens"
    implemented: true
    working: true
    file: "routers/images.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado com atualização parcial de campos"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Atualização parcial de URLs funcionando corretamente. Testado main e secondary URLs atualizadas com sucesso."

  - task: "POST /api/orders - Criar pedido"
    implemented: true
    working: true
    file: "routers/orders.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Testado via curl e frontend - 2 pedidos criados com sucesso"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Criação de pedido funcionando perfeitamente. Testado com dados completos do cliente, gera orderNumber único (NV-20260203-S0U9ZU), status inicial 'pending', todos os campos validados corretamente."

  - task: "GET /api/orders - Listar pedidos"
    implemented: true
    working: true
    file: "routers/orders.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado com ordenação por data decrescente"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Listagem de pedidos funcionando corretamente. Retorna array com todos os campos obrigatórios: _id, orderNumber, name, email, status, createdAt. Ordenação por data decrescente confirmada."

  - task: "GET /api/orders/:id - Buscar pedido específico"
    implemented: true
    working: true
    file: "routers/orders.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado - aceita ID ou número do pedido"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Busca por ID funcionando perfeitamente. Testado busca por _id e por orderNumber. Ambos retornam o pedido correto."

  - task: "PATCH /api/orders/:id/status - Atualizar status do pedido"
    implemented: true
    working: true
    file: "routers/orders.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementado com validação de status enum"
      - working: true
        agent: "testing"
        comment: "✅ APROVADO - Atualização de status funcionando perfeitamente. Testado todos os status válidos: pending -> paid -> shipped -> delivered. Validação de status inválido (422) funcionando corretamente."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan: |
  1. Testar todos os endpoints de settings (GET/PUT)
  2. Testar endpoints de images (GET/PUT) 
  3. Testar fluxo completo de criação de pedido
  4. Testar listagem e busca de pedidos
  5. Testar atualização de status de pedidos

agent_communication: |
  Backend implementado com 3 routers:
  - settings.py: Configurações do site (nome, tagline, contato, link pagamento)
  - images.py: URLs das imagens do produto
  - orders.py: CRUD de pedidos com número único e status
  
  Todos os endpoints já foram testados manualmente via curl e funcionaram.
  Frontend integrado e criando pedidos com sucesso.