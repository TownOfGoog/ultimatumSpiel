# Ultimatum-Spiel

## run dev server:
```
docker-compose -f docker-compose.dev.yaml up --build
```


## message types:
### frontend schickt:
neuer websocket
wenn jemand joint:
  backend schickt dem ersten verbundeten websocket ein message.type = new_player
  backend schickt allen ausser den ersten verbundeten websocket ein message.type = wait 
  message.data.class = z.B. "I3a"

message.type = start_game
wenn der Lehrer das Spiel startet:
  backend schickt allen ein message.type = new_round
  message.data.game = z.B. 1
  message.data.round = z.B. 1
  message.data.name = z.B. Du findest das Geld auf der Strasse
  backend schickt allen Spieler ein message.type = place_offer

message.type = start_round
wenn der Lehrer das Spiel startet:
  backend schickt allen ein message.type = new_round
  message.data.game = z.B. 1
  message.data.round = z.B. 2
  backend schickt allen Spieler ein message.type = place_offer

message.type = skip
wenn der Lehrer die jetzige Phase überspringen will:
  backend schickt allen ein message.type = answer_offer
  oder falls Lehrer in answer_offer Phase ist:
  backend schickt allen ein message.type = wait

message.type = offer
message.data.amount = z.B. 100
wenn ein Schüler ein Angebot abgeben:
  backend schickt allen ein message.type = wait 
  backend schickt Lehrperson ein message.type = new_offer
  message.data.amount = z.B. 30
  falls alle abgegeben haben:
  backend schickt allen ein message.type = answer_offer
  message.data.amount = z.B. 0

message.type = accept_offer
wenn ein Schüler sein erhaltenes Angebot akzeptiert:
  backend schickt ihm ein message.type = wait 
  backend schickt Lehrperson ein message.type = offer_response
  message.data.amount = z.B. 30
  message.data.accepted = true

message.type = decline_offer
wenn ein Schüler sein erhaltenes Angebot ablent:
  backend schickt allen ein message.type = wait 
  backend schickt Lehrperson ein message.type = offer_response
  message.data.amount = z.B. 30
  message.data.accepted = false

message.type = exit
wenn der Lehrer das Spiel beenden will:
  backend schickt allen message.type = exit

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

message.type = wait
wenn der Server will, dass der Frontend einfach wartet:
  frontend schickt nichts
