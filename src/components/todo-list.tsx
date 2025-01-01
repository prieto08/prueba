"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { subscribeTodos, addTodo, updateTodo, deleteTodo } from "@/lib/firebase"
import type { Todo } from "@/lib/types"

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Setting up Firebase subscription...');
    const unsubscribe = subscribeTodos((updatedTodos) => {
      console.log('Received todos update:', updatedTodos);
      setTodos(updatedTodos);
    });

    return () => {
      console.log('Cleaning up Firebase subscription...');
      unsubscribe();
    };
  }, []);

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    
    setIsLoading(true);
    setError(null);
    try {
      await addTodo(newTodo);
      setNewTodo("");
    } catch (err) {
      setError('Error al agregar la tarea. Por favor intenta de nuevo.');
      console.error("Error adding todo:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateTodo = async (id: string, newText: string) => {
    if (newText.trim() === "") return;
    
    setIsLoading(true);
    setError(null);
    try {
      await updateTodo(id, newText);
      setEditingId(null);
    } catch (err) {
      setError('Error al actualizar la tarea. Por favor intenta de nuevo.');
      console.error("Error updating todo:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteTodo = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteTodo(id);
    } catch (err) {
      setError('Error al eliminar la tarea. Por favor intenta de nuevo.');
      console.error("Error deleting todo:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Lista de Tareas</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 text-sm text-red-500 bg-red-50 rounded">
            {error}
          </div>
        )}
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Agregar nueva tarea"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
            disabled={isLoading}
          />
          <Button onClick={handleAddTodo} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center space-x-2">
              {editingId === todo.id ? (
                <Input
                  type="text"
                  defaultValue={todo.text}
                  onBlur={(e) => handleUpdateTodo(todo.id, e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUpdateTodo(todo.id, e.currentTarget.value)}
                  disabled={isLoading}
                  autoFocus
                />
              ) : (
                <>
                  <span className="flex-grow">{todo.text}</span>
                  <Button size="icon" variant="outline" onClick={() => setEditingId(todo.id)} disabled={isLoading}>
                    <Pencil className="w-4 h-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleDeleteTodo(todo.id)} disabled={isLoading}>
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        {todos.length === 0 ? 'No hay tareas pendientes' : `${todos.length} tareas en total`}
      </CardFooter>
    </Card>
  )
}