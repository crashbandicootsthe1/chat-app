<?php
require __DIR__ . '/vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class ChatServer implements MessageComponentInterface {
    protected $clients;
    protected $rooms;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->rooms = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $conn->send(json_encode(['type' => 'info', 'message' => 'Connected to server']));
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);

        switch ($data['type']) {
            case 'create_room':
                $roomCode = uniqid();
                $nickname = $data['nickname'];
                $this->rooms[$roomCode] = ['owner' => $from, 'clients' => []];
                $this->rooms[$roomCode]['clients'][$nickname] = $from;
                $from->send(json_encode(['type' => 'created_room', 'roomCode' => $roomCode]));
                break;

            case 'join_room':
                $roomCode = $data['roomCode'];
                $nickname = $data['nickname'];
                if (isset($this->rooms[$roomCode])) {
                    $this->rooms[$roomCode]['clients'][$nickname] = $from;
                    $from->send(json_encode(['type' => 'joined_room', 'roomCode' => $roomCode]));
                } else {
                    $from->send(json_encode(['type' => 'error', 'message' => 'Room not found']));
                }
                break;

            case 'send_message':
                $roomCode = $data['roomCode'];
                $message = $data['message'];
                $nickname = $data['nickname'];
                if (isset($this->rooms[$roomCode])) {
                    foreach ($this->rooms[$roomCode]['clients'] as $clientNickname => $client) {
                        if ($from !== $client) {
                            $client->send(json_encode([
                                'type' => 'message', 
                                'message' => $nickname . ': ' . $message
                            ]));
                        }
                    }
                }
                break;

            case 'delete_room':
                $roomCode = $data['roomCode'];
                if (isset($this->rooms[$roomCode]) && $this->rooms[$roomCode]['owner'] === $from) {
                    foreach ($this->rooms[$roomCode]['clients'] as $client) {
                        $client->send(json_encode(['type' => 'room_deleted', 'message' => 'The room was deleted']));
                    }
                    unset($this->rooms[$roomCode]);
                }
                break;
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $conn->close();
    }
}

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080
);

$server->run();
?>
