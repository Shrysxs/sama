import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Tool } from '@/types'

export default function TestPage() {
  const [tools, setTools] = useState<Tool[]>([])

  useEffect(() => {
    const fetchTools = async () => {
      const { data, error } = await supabase.from('tools').select('*')
      if (error) console.error(error)
      else setTools(data as Tool[])
    }

    fetchTools()
  }, [])

  return (
    <div>
      <h1>Tools</h1>
      <ul>
        {tools.map(tool => (
          <li key={tool.id}>{tool.title}</li>
        ))}
      </ul>
    </div>
  )
}
