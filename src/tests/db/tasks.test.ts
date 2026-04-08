/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import {
  getAllTasks,
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  incrementRealPomodoros
} from '@/db/tasks'
import { db } from '@/db/schema'

describe('tasks db operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets all tasks', async () => {
    const mockTasks = [{ id: '1', name: 'T1' }]
    vi.mocked(db.tasks.toArray).mockResolvedValue(mockTasks as any)

    const tasks = await getAllTasks()
    expect(tasks).toEqual(mockTasks)
    expect(vi.mocked(db.tasks.toArray)).toHaveBeenCalled()
  })

  it('gets tasks by project', async () => {
    const mockTasks = [{ id: '1', projectId: 'P1', name: 'T1' }]
    vi.mocked(db.tasks.toArray).mockResolvedValue(mockTasks as any)

    const tasks = await getTasksByProject('P1')
    expect(tasks).toEqual(mockTasks)
    expect(vi.mocked(db.tasks.where)).toHaveBeenCalledWith('projectId')
    const whereResult = db.tasks.where('') as unknown as { equals: MockedFunction<any> }
    expect(whereResult.equals).toHaveBeenCalledWith('P1')
  })

  it('gets task by id', async () => {
    const mockTask = { id: '1', name: 'T1' }
    vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any)

    const task = await getTaskById('1')
    expect(task).toEqual(mockTask)
    expect(vi.mocked(db.tasks.get)).toHaveBeenCalledWith('1')
  })

  it('creates a task with timestamps and uuid', async () => {
    const data = {
      name: 'New Task',
      projectId: 'P1',
      estimatedPomodoros: 3,
      realPomodoros: 0,
      status: 'pending' as const
    }
    const task = await createTask(data)

    expect(task.id).toBeDefined()
    expect(task.name).toBe(data.name)
    expect(task.createdAt).toBeDefined()
    expect(task.updatedAt).toBe(task.createdAt)
    expect(vi.mocked(db.tasks.add)).toHaveBeenCalledWith(task)
  })

  it('updates a task and its updatedAt timestamp', async () => {
    const mockTask = { id: '1', name: 'Original', updatedAt: 0 }
    const getSpy = vi.mocked(db.tasks.get)
    const updateSpy = vi.mocked(db.tasks.update)

    getSpy.mockImplementation(((id: string) => {
      const updateCall = updateSpy.mock.calls.find(call => call[0] === id)?.[1]
      if (updateCall) {
        const result = { ...mockTask, ...(updateCall as object) }
        return Promise.resolve(result as any)
      }
      return Promise.resolve(mockTask as any)
    }) as any)

    const updated = await updateTask('1', { name: 'Updated' })
    expect(updated.name).toBe('Updated')
    expect(updated.updatedAt).toBeGreaterThan(0)
    expect(updateSpy).toHaveBeenCalled()
  })

  it('deletes a task', async () => {
    await deleteTask('1')
    expect(vi.mocked(db.tasks.delete)).toHaveBeenCalledWith('1')
  })

  it('increments realPomodoros on a task', async () => {
    const mockTask = { id: '1', realPomodoros: 1, updatedAt: 0 }
    const getSpy = vi.mocked(db.tasks.get)
    const updateSpy = vi.mocked(db.tasks.update)

    getSpy.mockImplementation(((id: string) => {
      const updateCall = updateSpy.mock.calls.find(call => call[0] === id)?.[1]
      if (updateCall) {
        const result = { ...mockTask, ...(updateCall as object) }
        return Promise.resolve(result as any)
      }
      return Promise.resolve(mockTask as any)
    }) as any)

    await incrementRealPomodoros('1')
    expect(updateSpy).toHaveBeenCalledWith('1', {
      realPomodoros: 2,
      updatedAt: expect.any(Number)
    })
  })
})
