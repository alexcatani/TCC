
#!/bin/bash
 
xset s noblank
xset s off
xset -dpms
 
unclutter -idle 0.5 -root &
 
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences
 
/usr/bin/chromium --noerrdialogs --disable-infobars --kiosk http://painelvirtual.atlas.ind.br/painel_virtual/Manufatura/painelmontagem.html #&
 
#Altera entre as URL setadas
# Obs: Não precisa habilitar
# while true; do
#   xdotool keydown ctrl+Tab; xdotool keyup ctrl+Tab;
#   sleep 20
# done