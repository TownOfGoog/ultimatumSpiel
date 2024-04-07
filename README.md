# Ultimatum-Spiel

## run dev server:
```
docker-compose -f docker-compose.dev.yaml up --build
```


## message types:
### frontend schickt:
neuer websocket
wenn jemand joint:
  backend schickt dem ersten verbundeten websocket ein message.type = player_count 
  message.data.count = z.B. 6
  backend schickt allen ausser dem ersten verbundenen websocket ein message.type = wait 
  NUR AM ERSTEN MAL: message.data.class = z.B. "I3a"

message.type = start_game
wenn der Lehrer das Spiel startet:
  backend schickt allen ein message.type = place_offer 
  message.data.game = z.B. 1
  message.data.round = z.B. 1

message.type = start_round
wenn der Lehrer das Spiel startet:
  backend schickt allen ein message.type = place_offer 

message.type = offer
message.data.amount = z.B. 100
wenn ein Schüler ein Angebot abgeben:
  backend schickt allen ein message.type = wait 
  falls alle abgegeben haben:
  backend schickt allen ein message.type = answer_offer
  message.data.amount = z.B. 0

message.type = accept_offer
wenn ein Schüler sein erhaltenes Angebot akzeptiert:
  backend schickt allen ein message.type = wait 

message.type = decline_offer
wenn ein Schüler sein erhaltenes Angebot ablent:
  backend schickt allen ein message.type = wait 


### backend schickt:
message.type = place_offer
wenn der Server will, dass alle ein Angebot abgeben:
  frontent schickt message.type = offer
  message.data.amount = z.B. 100

message.type = answer_offer
message.data.amount = z.B. 100
wenn der Server will, dass alle ein Angebot annehmen/ablehnen:
  frontent schickt message.type = accept_offer
  oder
  frontent schickt message.type = decline_offer

message.type = player_count
message.data.count = z.B. 6
wenn der server die anzahl Spieler schickt:
  frontend schickt nichts

message.type = wait
wenn der Server will, dass der Frontend einfach wartet:
  frontend schickt nichts
