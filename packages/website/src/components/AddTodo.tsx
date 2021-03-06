import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useEffect } from 'react';
import {
  // FC,
  DetailedHTMLProps,
  InputHTMLAttributes,
} from "react"
import { TodoTask } from '../../../wrapper/lib';
import { useWrappedConn } from '../hooks/useConn';
export type AddUserProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;
export default function AddUser(props: { pass: string, button: string, form: string, selectedUser: string, refresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState("");
  const [todoName, setTodoName] = useState("");
  const [subtaskName, setSubtaskName] = useState("");
  const [subtasks, setSubtasks] = useState<TodoTask[]>();
  const wrapper = useWrappedConn();

  useEffect(() => {
    setUsername(props.selectedUser)
  }, [props.selectedUser])

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const submit = () => {
    wrapper.mutation.todo.create(username, todoName, subtasks ? subtasks : []).then((resp) => {
      if (!resp.success) console.error(resp.error);
      if (resp.success) { closeModal(); props.refresh() }
    })
  }

  const addSubtask = () => {
    const task = { name: subtaskName, completed: false, id: '' };
    setSubtasks((t) => t ? t.concat(task) : [task])
  }


  return (
    <>

      <button
        type="button"
        onClick={openModal}
        className="px-4 py-2 float-right mr-3 text-sm font-medium rounded-lg bg-opacity-100 hover:bg-opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75  text-white bg-indigo-600 "
      >
        {props.pass}
      </button>


      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="mt-2">
                  <div className=' flex bg-gray-bg1'>
                    <div className='w-full  max-w-md m-auto bg-white rounded-lg border border-primary Border shadow-default py-10 px-16'>
                      <h1 className='text-2xl font-medium text-primary mt-4 mb-12 text-center'>
                        {props.form}
                      </h1>

                      <form >
                        <div>
                          <label htmlFor='user'>User</label>
                          <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type='user'
                            className={`w-full p-2 text-primary border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4`}
                            id='user'
                            placeholder='user'
                          />
                        </div>
                        <div>
                          <label htmlFor='work'>Job</label>
                          <input
                            value={todoName}
                            onChange={(e) => setTodoName(e.target.value)}
                            type='work'
                            className={`w-full p-2 text-primary border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4`}
                            id='work'
                            placeholder='job title'
                          />
                        </div>

                        <div>
                          <label>Subtasks</label>
                          <textarea
                            value={subtaskName}
                            onChange={(e) => setSubtaskName(e.target.value)}
                            // type='text'
                            className={`resize-y  w-full overflow-clip p-2 normal-case text-primary border rounded-md outline-none text-sm transition duration-150  mb-4`}
                            id='subtask'
                            placeholder='Subtask Title'
                          />
                          <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                            onClick={addSubtask}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center px-4 m-2 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                            onClick={addSubtask}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center px-4  py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                            onClick={addSubtask}
                          >
                            Delete
                          </button>

                          {subtasks && subtasks.map((t) => <p>{t.name}</p>)}
                        </div>

                        <div className='flex justify-center items-center mt-6'>
                          <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                            onClick={submit}
                          >
                            {props.button}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>


              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
