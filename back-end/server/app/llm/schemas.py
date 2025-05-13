from pydantic import BaseModel, Field

class AskResponse(BaseModel):
    next_step: str = Field(..., description="These are questions you need to ask the user to gather more information. If these are not questions, then it should be a task which will be given to another agent to complete based on the information. ")
    is_update_sequence: bool = Field(..., description="This will decide if user is asking you to update the task or create a new task.")
    ready_for_executions: bool = Field(..., description="This will decide user has given you all the information or they confirmed that you can proceed with executing the task. This should be true when you say sequence update is true.")
    information_gathered: str = Field(..., description="This will be all the information you gathered for the task.")
    
class Step(BaseModel):
    number: int
    explanation: str

class SequenceResponse(BaseModel):
    description: str = Field(..., description="What is this sequence about?")
    steps: list[Step]

class ConversationTitle(BaseModel):
    title: str = Field(..., description="Title of the conversation")