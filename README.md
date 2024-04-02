# Ultimatum-Spiel

## run dev server:
```
docker-compose -f docker-compose.dev.yaml up --build
```


## message types:
### frontend
message.type = start_round
wenn der Lehrer das Spiel startet:

message.type = offer
wenn ein Schüler ein Angebot abgeben
message.data.amount = z.B. 100

message.type = accept_offer
wenn ein Schüler sein erhaltenes Angebot akzeptiert

message.type = decline_offer
wenn ein Schüler sein erhaltenes Angebot ablent


### backend
message.type = play_round
wenn der Server allen einen Befehl gibt

message.data.action = place_offer
wenn der Server will, dass alle ein Angebot geben

message.data.action = answer_offer
wenn der Server will, dass alle ein Angebot annehmen/ablehnen.
message.data.amount = z.B. 100

message.type = player_count
wenn der server die anzahl Spieler schickt
message.data = z.B. 6

message.type = wait
wenn der Server will, dass der Frontend einfach wartet
