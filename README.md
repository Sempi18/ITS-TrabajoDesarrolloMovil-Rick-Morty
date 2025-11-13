# MultiversoHub: Rick & Morty App

## Descripción del Proyecto

Aplicación móvil educativa y de entretenimiento construida con React Native y Expo, que permite a los usuarios explorar personajes de la serie Rick and Morty. Incluye funcionalidades clave como gestión de una lista de favoritos (con persistencia local) y modo offline para una experiencia continua.

## Setup del proyecto

Para ejecutar la aplicación localmente, sigue estos sencillos pasos:

**Clonar el repositorio**:

```
Bash
git clone 
cd
```

**Instalar dependencias**:

```
Bash
npm install
```

**Iniciar la aplicación**:

```
Bash
npx expo start
```

Ejecutar:

Escanea el código QR con la app Expo Go en tu dispositivo o presiona w para la versión web.

## Decisiones de Diseño e Implementación

**Navegación:** Expo Router simplifica la creación de stacks y tabs de forma declarativa, manteniendo una estructura de navegación intuitiva y organizada.

**Gestión de Estado:** Se eligió Context API + useReducer para manejar el estado global de favoritos. Es una solución ligera y suficiente para el alcance del proyecto, evitando dependencias externas complejas.

**Persistencia:** AsyncStorage es ideal por su simplicidad para almacenar datos no relacionales y de pequeña escala (como la lista de favoritos).

**Modo offline:** La integración con react-native-netinfo mejora la UX al detectar la conexión, permitiendo que la aplicación siga funcionando parcialmente con datos en caché cuando no hay internet.

**Telemetría básica:** Uso de console.log() en un archivo dedicado (telemetry.ts) para facilitar la depuración y obtener una visión inicial del comportamiento del usuario.

## Tecnologías Clave

**Framework Principal: React Native** (con **Expo**)

**Navegación: Expo Router** (sistema basado en archivos)

**Gestión de Estado: Context API** y useReducer

**Persistencia Local: AsyncStorage** (para favoritos y configuración)

**Conectividad: react-native-netinfo** (para modo offline)

**Fuente de Datos: Rick and Morty API** (API pública)

## Aprendizajes Clave

**Simplificación de Estructura**: Se comprobó la eficacia de Expo Router para manejar la arquitectura de navegación compleja sin necesidad de configurar manualmente librerías como react-navigation.

**Balance en la Gestión de Estado**: Se reafirmó que no siempre es necesaria una librería pesada como Redux o Zustand; la combinación nativa de Context API y useReducer es potente para manejar estados globales moderados de manera eficiente y con menos boilerplate.

**Manejo de Offline**: Se dominó la implementación de un flujo de datos robusto que maneja la persistencia (AsyncStorage) junto con la detección de red (react-native-netinfo) para ofrecer una experiencia de usuario fluida incluso sin conexión.
