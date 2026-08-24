import { supabase } from '../supabase';
import { AppError } from '../auth';
import { Role, ProposalStatus } from '@/types/database';


export class ChatService {
  static async getConversations(userId: string) {
    const { data: convs, error } = await supabase
      .from('conversations')
      .select(`
        id,
        project_id,
        client_id,
        freelancer_id,
        updated_at,
        created_at,
        projects (id, title, status, budget),
        client:users!client_id (id, full_name, email, avatar_url),
        freelancer:users!freelancer_id (id, full_name, email, avatar_url),
        messages (
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch conversations: ${error.message}`, 500);
    }

    return (convs || []).map((c: any) => {
      const project = Array.isArray(c.projects) ? c.projects[0] : c.projects;
      const client = Array.isArray(c.client) ? c.client[0] : c.client;
      const freelancer = Array.isArray(c.freelancer) ? c.freelancer[0] : c.freelancer;
      const sortedMessages = (c.messages || []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestMessage = sortedMessages[0];

      return {
        id: c.id,
        projectId: c.project_id,
        clientId: c.client_id,
        freelancerId: c.freelancer_id,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        project: project
          ? { id: project.id, title: project.title, status: project.status, budget: project.budget }
          : null,
        client: client
          ? { id: client.id, fullName: client.full_name, email: client.email, avatarUrl: client.avatar_url }
          : null,
        freelancer: freelancer
          ? { id: freelancer.id, fullName: freelancer.full_name, email: freelancer.email, avatarUrl: freelancer.avatar_url }
          : null,
        messages: latestMessage
          ? [
              {
                id: latestMessage.id,
                content: latestMessage.content,
                createdAt: latestMessage.created_at,
                senderId: latestMessage.sender_id,
              },
            ]
          : [],
      };
    });
  }

  static async getOrCreateConversation(
    userId: string,
    userRole: Role,
    projectId: string,
    otherUserId: string
  ) {
    let clientId: string;
    let freelancerId: string;

    if (userRole === Role.CLIENT) {
      clientId = userId;
      freelancerId = otherUserId;
    } else if (userRole === Role.FREELANCER) {
      clientId = otherUserId;
      freelancerId = userId;
    } else {
      throw new AppError('Only clients and freelancers can participate in conversations.', 403);
    }

    const { data: freelancer } = await supabase
      .from('users')
      .select('id, freelancer_profiles (id)')
      .eq('id', freelancerId)
      .maybeSingle();

    const fp = freelancer
      ? Array.isArray(freelancer.freelancer_profiles)
        ? freelancer.freelancer_profiles[0]
        : freelancer.freelancer_profiles
      : null;

    if (!freelancer || !fp) {
      throw new AppError('Freelancer profile not found.', 404);
    }

    // Verify chat access rule: Proposal must be SHORTLISTED or ACCEPTED
    const { data: eligibleProposal } = await supabase
      .from('proposals')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('freelancer_id', fp.id)
      .in('status', [ProposalStatus.SHORTLISTED, ProposalStatus.ACCEPTED])
      .maybeSingle();

    if (!eligibleProposal) {
      throw new AppError(
        'Direct messaging is only permitted once a proposal has been shortlisted or accepted.',
        403
      );
    }

    // Upsert conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('project_id', projectId)
      .eq('client_id', clientId)
      .eq('freelancer_id', freelancerId)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          project_id: projectId,
          client_id: clientId,
          freelancer_id: freelancerId,
        })
        .select('id')
        .single();
      conversation = newConv;
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }

    if (!conversation) {
      throw new AppError('Failed to initialize conversation.', 500);
    }

    const { data: fullConv } = await supabase
      .from('conversations')
      .select(`
        id,
        project_id,
        client_id,
        freelancer_id,
        created_at,
        updated_at,
        projects (id, title, status, budget),
        client:users!client_id (id, full_name, email, avatar_url),
        freelancer:users!freelancer_id (id, full_name, email, avatar_url)
      `)
      .eq('id', conversation.id)
      .single();

    if (!fullConv) {
      throw new AppError('Conversation could not be loaded.', 500);
    }

    const pr = fullConv.projects ? (Array.isArray(fullConv.projects) ? fullConv.projects[0] : fullConv.projects) : null;
    const cl = fullConv.client ? (Array.isArray(fullConv.client) ? fullConv.client[0] : fullConv.client) : null;
    const fr = fullConv.freelancer ? (Array.isArray(fullConv.freelancer) ? fullConv.freelancer[0] : fullConv.freelancer) : null;

    return {
      id: fullConv.id,
      projectId: fullConv.project_id,
      clientId: fullConv.client_id,
      freelancerId: fullConv.freelancer_id,
      createdAt: fullConv.created_at,
      updatedAt: fullConv.updated_at,
      project: pr ? { id: pr.id, title: pr.title, status: pr.status, budget: pr.budget } : null,
      client: cl ? { id: cl.id, fullName: cl.full_name, email: cl.email, avatarUrl: cl.avatar_url } : null,
      freelancer: fr ? { id: fr.id, fullName: fr.full_name, email: fr.email, avatarUrl: fr.avatar_url } : null,
    };
  }

  static async getMessages(userId: string, conversationId: string) {
    const { data: conversation } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        freelancer_id,
        projects (id, title, status),
        client:users!client_id (id, full_name, email, avatar_url),
        freelancer:users!freelancer_id (id, full_name, email, avatar_url)
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    if (conversation.client_id !== userId && conversation.freelancer_id !== userId) {
      throw new AppError('Unauthorized: You do not have access to this conversation.', 403);
    }

    const { data: messages } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        users (id, full_name, avatar_url, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const formattedMessages = (messages || []).map((m: any) => {
      const u = Array.isArray(m.users) ? m.users[0] : m.users;
      return {
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content,
        createdAt: m.created_at,
        sender: u ? { id: u.id, fullName: u.full_name, avatarUrl: u.avatar_url, role: u.role } : null,
      };
    });

    const pr = Array.isArray(conversation.projects) ? conversation.projects[0] : conversation.projects;
    const cl = Array.isArray(conversation.client) ? conversation.client[0] : conversation.client;
    const fr = Array.isArray(conversation.freelancer) ? conversation.freelancer[0] : conversation.freelancer;

    return {
      conversation: {
        id: conversation.id,
        clientId: conversation.client_id,
        freelancerId: conversation.freelancer_id,
        project: pr ? { id: pr.id, title: pr.title, status: pr.status } : null,
        client: cl ? { id: cl.id, fullName: cl.full_name, email: cl.email, avatarUrl: cl.avatar_url } : null,
        freelancer: fr ? { id: fr.id, fullName: fr.full_name, email: fr.email, avatarUrl: fr.avatar_url } : null,
      },
      messages: formattedMessages,
    };
  }

  static async sendMessage(userId: string, conversationId: string, content: string) {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, client_id, freelancer_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    if (conversation.client_id !== userId && conversation.freelancer_id !== userId) {
      throw new AppError('Unauthorized: You cannot post messages in this conversation.', 403);
    }

    const trimmedContent = content?.trim();
    if (!trimmedContent) {
      throw new AppError('Message content cannot be empty.', 400);
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: trimmedContent,
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        users (id, full_name, avatar_url, role)
      `)
      .single();

    if (error || !message) {
      throw new AppError(`Failed to send message: ${error?.message}`, 500);
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    const u = Array.isArray(message.users) ? message.users[0] : message.users;

    return {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      sender: u ? { id: u.id, fullName: u.full_name, avatarUrl: u.avatar_url, role: u.role } : null,
    };
  }
}
