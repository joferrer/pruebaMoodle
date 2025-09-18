

interface Prompt {
    id: string;
    prompt: string;
}

export const systemPrompt = `Eres un evaluador de código de Arduino. Tu tarea es analizar el código proporcionado y responder con una calificación entre 0 y 1 (donde 0 es muy malo y 1 es excelente) y un comentario corto que explique la calificación. El comentario debe ser claro, conciso y sin información innecesaria. Si tienes múltiples comentarios, elige el más relevante. No debes corregir el código, solo evaluarlo. No uses más de 50 tokens en la respuesta. 
El formato de salida debe ser exactamente este (sin comillas ni JSON, todo en una sola línea):

CALIFICACION=0.5; COMENTARIO=El código es bueno, pero tiene algunos errores menores.`

const prompts: Prompt[] = [
    {
        id: "led-basic-code",
        prompt: "Al calificarse este código, considere que el pin del led debe ser el 13 y el codigo debe encender y apagar el led una vez por segundo"
    },
    {
        id: "bombilla-bluetooth-code",
        prompt: "Al calificarse este código, considere que el pin de la bombilla debe ser el 9 y el modulo de bluetooth se usa con esta libreria #include <SoftwareSerial.h>. El codigo debe encender la bombilla con el comando 'E' y apagarla con el comando 'A' que se recibe por bluetooth. Este es un ejemplo de lo que se espera: #define foco 9 #include <SoftwareSerial.h> SoftwareSerial BT(3, 2); void setup() { Serial.begin(9600); BT.begin(9600); pinMode(foco, OUTPUT); } void loop() { if (BT.available()) { char comando = BT.read(); if (comando == 'E') { digitalWrite(foco, HIGH); } else if (comando == 'A') { digitalWrite(foco, LOW); } } }"
    },
    {
        id: "peticion-http-code",
        prompt: 'Al calificarse este codigo, considere que se va usar la libreria HTTPClient que tiene los metodos begin, addHeader,POST, getString y end. La idea es que el codigo haga una peticion POST a la url "https://nuestroincreiblementerapidoservidor/api/resgistrarRiego" con el header Content-Type: application/json y el body {\"idPlanta\":string,\"humedad\":number}, la humedad puede enviarse string pero el servidor la debe poder convertir en number. Luego debe imprimir en consola la respuesta del servidor. El codigo que resivas probablemente incluya partes de lectura de datos de humedad y conexion al wifi pero eso puede ignorarlo en la calificacion. Los puntos a evaluar son: 1. Uso correcto de la libreria HTTPClient. 2. Formato correcto de la peticion HTTP (URL, headers, body). 3. Manejo adecuado de la respuesta del servidor. 4. Limpieza y claridad del codigo. Este es un ejemplo de lo que se espera:#include <HTTPClient.h> const char* serverUrl = "https://nuestroincreiblementerapidoservidor/api/resgistrarRiego";void registrarRiego() { if (WiFi.status() == WL_CONNECTED) { HTTPClient http; http.begin(serverUrl); http.addHeader("Content-Type", "application/json"); String jsonPayload = "{\"idPlanta\":\"" + String(id) + "\", \"humedad\":\"" + String(valorSensor) + "\"}"; int httpResponseCode = http.POST(jsonPayload); if (httpResponseCode > 0) { String response = http.getString(); Serial.println("Respuesta del servidor:"); Serial.println(response); } else { Serial.printf("Error HTTP: %s\n", http.errorToString(httpResponseCode).c_str()); } http.end(); } else { Serial.println("Error: WiFi no conectado"); } }'
    }
]

export const getPromptById = (id: string): Prompt | undefined => {
    return prompts.find(p => p.id === id);
}

