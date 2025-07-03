# Test Spell Combat Integration

Write-Host "Testing Spell Combat Integration..." -ForegroundColor Green

# Step 1: Login to get token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    username = "test"
    password = "test"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get characters
Write-Host "`n2. Getting characters..." -ForegroundColor Yellow
try {
    $characters = Invoke-RestMethod -Uri "http://localhost:3001/api/characters" -Method GET -Headers @{ "Authorization" = "Bearer $token" }
    Write-Host "Found $($characters.Count) characters" -ForegroundColor Green
    
    if ($characters.Count -eq 0) {
        Write-Host "No characters found. Creating a test character..." -ForegroundColor Yellow
        
        # Create a test character
        $createCharBody = @{
            name = "TestMage"
            characterClass = "AETHER_WEAVER"
        } | ConvertTo-Json
        
        $newCharacter = Invoke-RestMethod -Uri "http://localhost:3001/api/characters" -Method POST -Body $createCharBody -Headers @{ "Authorization" = "Bearer $token" } -ContentType "application/json"
        $characterId = $newCharacter.id
        Write-Host "Created character: $($newCharacter.name) (ID: $characterId)" -ForegroundColor Green
    } else {
        $characterId = $characters[0].id
        Write-Host "Using character: $($characters[0].name) (ID: $characterId)" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to get/create character: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Learn a spell
Write-Host "`n3. Learning a spell..." -ForegroundColor Yellow
try {
    $learnBody = @{
        spellId = 1  # Glimmering Bolt
    } | ConvertTo-Json
    
    $learnResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/character/$characterId/learn-spell" -Method POST -Body $learnBody -Headers @{ "Authorization" = "Bearer $token" } -ContentType "application/json"
    Write-Host "Successfully learned spell: $($learnResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "Failed to learn spell: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test spellbook
Write-Host "`n4. Testing spellbook..." -ForegroundColor Yellow
try {
    $spellbook = Invoke-RestMethod -Uri "http://localhost:3001/api/character/$characterId/spellbook" -Method GET -Headers @{ "Authorization" = "Bearer $token" }
    Write-Host "Spellbook retrieved successfully!" -ForegroundColor Green
    Write-Host "Character has $($spellbook.spells.Count) known spells" -ForegroundColor Cyan
    
    if ($spellbook.spells.Count -gt 0) {
        $firstSpell = $spellbook.spells[0]
        Write-Host "First spell: $($firstSpell.name) (ID: $($firstSpell.id))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Failed to get spellbook: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSpell combat integration test completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Connect to the game via WebSocket" -ForegroundColor White
Write-Host "2. Use 'spells' command to see your spellbook" -ForegroundColor White
Write-Host "3. Use 'cast <spell_name> <target>' to cast spells" -ForegroundColor White
Write-Host "4. Use 'learn <spell_name>' to learn new spells" -ForegroundColor White 